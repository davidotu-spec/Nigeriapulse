import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Firestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';

// Backend Services
import { UserService } from './src/services/backend/userService';
import { SurveyService } from './src/services/backend/surveyService';
import { AnalyticsService } from './src/services/backend/analyticsService';
import { NotificationService } from './src/services/backend/notificationService';
import { GoogleGenAI, Type, Modality } from "@google/genai";

let firebaseConfig: any;
try {
  firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
} catch (e) {
  console.error("Failed to read firebase-applet-config.json", e);
}

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    // Initialize Firebase Admin
    let adminApp: App;
    try {
      const apps = getApps();
      if (apps.length === 0) {
        // ALWAYS prioritize config if available to avoid using wrong default project
        if (firebaseConfig?.projectId) {
          console.log("Initializing Firebase Admin with config project:", firebaseConfig.projectId);
          adminApp = initializeApp({
            projectId: firebaseConfig.projectId
          });
        } else {
          console.log("No config found, trying default credentials");
          adminApp = initializeApp();
        }
      } else {
        adminApp = apps[0];
      }
    } catch (err) {
      console.error("Firebase Admin initialization error:", err);
      return;
    }

    // Initialize Firestore with specific database ID if available
    let db: Firestore;
    const dbId = firebaseConfig?.firestoreDatabaseId;
    try {
      if (dbId) {
        console.log("Using non-default Firestore database:", dbId);
        db = getFirestore(adminApp, dbId);
      } else {
        db = getFirestore(adminApp);
      }
    } catch (e) {
      console.error("Firestore initialization error:", e);
      db = getFirestore(adminApp);
    }
    
    const messaging = getMessaging(adminApp);

    // Instantiate Services
    const userService = new UserService(db);
    const surveyService = new SurveyService(db);
    const analyticsService = new AnalyticsService(db);
    const notificationService = new NotificationService(db, messaging);

    // Initialize Gemini
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    app.use(express.json());

    // API Key Validation Middleware
    const validateApiKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const apiKey = req.header('X-Pulse-API-Key');
      if (!apiKey) return res.status(401).json({ error: "API Key missing." });

      try {
        const keyDoc = await db.collection('api_keys').doc(apiKey).get();
        if (!keyDoc.exists || keyDoc.data()?.status !== 'active') {
          return res.status(403).json({ error: "Invalid API Key." });
        }
        (req as any).apiKeyInfo = keyDoc.data();
        next();
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    };

    // --- SERVICE ENDPOINTS ---

    // User Profile
    app.get("/api/v1/user/:userId", async (req, res) => {
      const profile = await userService.getUserProfile(req.params.userId);
      if (!profile) return res.status(404).json({ error: "User not found" });
      res.json(profile);
    });

    // Survey Engine & Voting
    app.post("/api/v1/pulse/:surveyId/vote", async (req, res) => {
      const { optionIndex, userId } = req.body;
      const { surveyId } = req.params;
      
      try {
        const voteResult = await surveyService.castVote(surveyId, optionIndex);
        
        // If logged in, award points and update streak
        if (userId) {
          await userService.updateParticipation(userId, surveyId);
        }
        
        res.json(voteResult);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // Analytics Engine
    app.get("/api/v1/pulse/:surveyId/analytics", validateApiKey, async (req, res) => {
      const stats = await analyticsService.getSurveyResults(req.params.surveyId);
      if (!stats) return res.status(404).json({ error: "Survey not found" });
      res.json(stats);
    });

    // Notification Service (FCM Registration)
    app.post("/api/v1/notifications/register", async (req, res) => {
      const { userId, token } = req.body;
      await notificationService.registerToken(userId, token);
      res.json({ success: true });
    });

    // Broadcast (Admin only)
    app.post("/api/v1/admin/broadcast", async (req, res) => {
      const { title, body, secret } = req.body;
      if (secret !== "PULSE_ADMIN_SECRET") return res.status(403).json({ error: "Unauthorized" });
      
      const result = await notificationService.broadcast(title, body);
      res.json(result);
    });

    // Specific Survey Broadcast (Admin only)
    app.post("/api/v1/admin/broadcast-survey", async (req, res) => {
      const { surveyId, surveyTitle, secret } = req.body;
      if (secret !== "PULSE_ADMIN_SECRET") return res.status(403).json({ error: "Unauthorized" });
      
      const result = await notificationService.broadcast(
        "New Pulse: Voice Your Opinion! ⚡",
        surveyTitle,
        { 
          surveyId, 
          type: 'survey_invite',
          click_action: 'FLUTTER_NOTIFICATION_CLICK' // For mobile deep links if applicable
        }
      );
      res.json(result);
    });

    // Legacy Public API Endpoints (adapted)
    app.get("/api/v1/pulse", validateApiKey, async (req, res) => {
      const surveys = await surveyService.listActiveSurveys();
      res.json({ surveys });
    });

    app.get("/api/v1/pulse/:surveyId/results", validateApiKey, async (req, res) => {
      const results = await analyticsService.getSurveyResults(req.params.surveyId);
      if (!results) return res.status(404).json({ error: "Survey not found" });
      res.json(results);
    });

    // AI Insight Summary
    app.get("/api/v1/pulse/:surveyId/ai-summary", async (req, res) => {
      const { surveyId } = req.params;
      const { lang = 'en' } = req.query;
      
      try {
        const surveyDoc = await db.collection('surveys').doc(surveyId).get();
        if (!surveyDoc.exists) return res.status(404).json({ error: "Survey not found" });
        const surveyData = surveyDoc.data();

        // Get recent comments for context
        const commentsSnap = await db.collection('surveys').doc(surveyId).collection('comments')
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get();
        const comments = commentsSnap.docs
          .map(doc => doc.data().comment)
          .filter(t => typeof t === 'string' && t.trim().length > 0)
          .join('\n');

        const languageNames: Record<string, string> = {
          en: 'English',
          pidgin: 'Nigerian Pidgin English',
          yoruba: 'Yoruba',
          hausa: 'Hausa',
          igbo: 'Igbo'
        };

        const targetLang = languageNames[lang as string] || 'English';

        const prompt = `Analyze these pulse survey results for a "Nigeria Pulse" app. 
        Question: ${surveyData?.question || 'Untitled Survey'}
        Options: ${(surveyData?.options || []).join(', ')}
        Results Breakdown: ${JSON.stringify(surveyData?.results || {})}
        Total Votes Collected: ${surveyData?.totalVotes || 0}
        Recent Participant Comments:
        ${comments || 'No comments yet'}

        Provide a concise, engaging summary (max 150 words) of the "National Sentiment". 
        Use a professional yet energetic tone. Highlight any strong leanings or interesting tensions in the data.
        
        CRITICAL: The entire response MUST be in ${targetLang}.
        
        Include a final "Pulse Vibe" (one word or short phrase in ${targetLang}).
        Format the response in JSON with keys: 'summary' and 'vibe'.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an expert Nigerian political analyst and data scientist. Synthesize survey data into clear, culturally relevant insights.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { 
                  type: Type.STRING,
                  description: "A 2-3 paragraph analysis of the survey results and comments."
                },
                vibe: { 
                  type: Type.STRING,
                  description: "A single word or very short phrase capturing the overall mood."
                }
              },
              required: ["summary", "vibe"]
            }
          }
        });

        if (!response.text) {
          console.error("Gemini response missing text. Full response:", JSON.stringify(response));
          throw new Error("Empty response from AI model");
        }

        try {
          const parsed = JSON.parse(response.text.trim());
          res.json(parsed);
        } catch (parseError) {
          console.error("JSON Parse Error on AI response:", response.text);
          // Try to extract JSON if it's wrapped in markdown code blocks
          const jsonMatch = response.text.match(/```json\s?([\s\S]*?)```/) || response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const cleanJson = jsonMatch[1] || jsonMatch[0];
            res.json(JSON.parse(cleanJson.trim()));
          } else {
            throw new Error("Could not parse AI response as JSON");
          }
        }
      } catch (error: any) {
        console.error("Gemini error details:", error);
        res.status(500).json({ 
          error: "Failed to generate AI insights",
          details: error.message || String(error)
        });
      }
    });

    // Researcher CSV Export
    app.get("/api/v1/admin/export/:surveyId", async (req, res) => {
      const { surveyId } = req.params;
      const { apiKey } = req.query;

      // Validate API Key or Session
      const isValidKey = await db.collection('apiKeys').doc(apiKey as string).get();
      if (!isValidKey.exists) return res.status(403).json({ error: "Invalid API Key" });

      try {
        const votesSnap = await db.collection('surveys').doc(surveyId).collection('votes').get();
        
        let csv = 'timestamp,choice,ageRange,state,deviceType\n';
        votesSnap.docs.forEach(doc => {
          const v = doc.data();
          const timestamp = v.timestamp?.toDate?.()?.toISOString() || '';
          csv += `${timestamp},"${v.choice}","${v.ageRange || 'N/A'}","${v.state || 'N/A'}","${v.deviceType || 'unknown'}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=pulse_export_${surveyId}.csv`);
        res.status(200).send(csv);
      } catch (error) {
        res.status(500).json({ error: "Export failed" });
      }
    });

    app.post("/api/admin/init", async (req, res) => {
      const { email, uid } = req.body;
      if (email !== 'davidotu@mixxd.org') return res.status(403).json({ error: "Unauthorized" });
      
      await db.collection('admins').doc(uid).set({ email, role: 'superadmin', updatedAt: FieldValue.serverTimestamp() });
      res.json({ success: true });
    });

    // Admin endpoint to generate API keys
    app.post("/api/v1/admin/keys", async (req, res) => {
      const { secret, ownerEmail } = req.body;
      if (secret !== "PULSE_ADMIN_SECRET") return res.status(403).json({ error: "Unauthorized" });

      try {
        const key = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        await db.collection('api_keys').doc(key).set({
          ownerEmail,
          status: 'active',
          createdAt: FieldValue.serverTimestamp(),
        });
        res.json({ success: true, key });
      } catch (error) {
        res.status(500).json({ error: "Failed to generate API Key" });
      }
    });

    // TTS Commercial Voiceover
    app.post("/api/v1/commercial/tts", async (req, res) => {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: `Speak with a warm, professional, and vibrant Nigerian woman's accent, full of pride and clarity: ${text}`,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");

        res.json({ audio: base64Audio });
      } catch (error: any) {
        console.error("TTS Error:", error);
        res.status(500).json({ error: "Voiceover generation failed" });
      }
    });

    // Vite & Static assets
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("CRITICAL ERROR:", err);
  }
}

startServer();
