var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_app = require("firebase-admin/app");
var import_firestore4 = require("firebase-admin/firestore");
var import_messaging = require("firebase-admin/messaging");
var import_fs = __toESM(require("fs"), 1);

// src/services/backend/userService.ts
var import_firestore = require("firebase-admin/firestore");
var UserService = class {
  constructor(db) {
    this.db = db;
  }
  async getUserProfile(userId) {
    const doc = await this.db.collection("users").doc(userId).get();
    if (!doc.exists) return null;
    return doc.data();
  }
  async updateParticipation(userId, surveyId) {
    const userRef = this.db.collection("users").doc(userId);
    const historyRef = userRef.collection("participation").doc(surveyId);
    return this.db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const historySnap = await transaction.get(historyRef);
      if (historySnap.exists) {
        return { success: false, message: "Already participated in this survey" };
      }
      const now = /* @__PURE__ */ new Date();
      const userData = userSnap.data() || {};
      const lastParticipation = userData.lastParticipationAt?.toDate?.() || /* @__PURE__ */ new Date(0);
      let streak = userData.streak || 0;
      const hoursSinceLast = (now.getTime() - lastParticipation.getTime()) / (1e3 * 60 * 60);
      if (hoursSinceLast < 48) {
        streak += 1;
      } else {
        streak = 1;
      }
      transaction.set(historyRef, {
        surveyId,
        votedAt: import_firestore.FieldValue.serverTimestamp()
      });
      transaction.set(userRef, {
        points: import_firestore.FieldValue.increment(10),
        streak,
        lastParticipationAt: import_firestore.FieldValue.serverTimestamp(),
        updatedAt: import_firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { success: true, streak, pointsAwarded: 10 };
    });
  }
  async listParticipatedSurveys(userId) {
    const snapshot = await this.db.collection("users").doc(userId).collection("participation").orderBy("votedAt", "desc").limit(20).get();
    return snapshot.docs.map((doc) => doc.data());
  }
};

// src/services/backend/surveyService.ts
var import_firestore2 = require("firebase-admin/firestore");
var SurveyService = class {
  constructor(db) {
    this.db = db;
  }
  async createSurvey(data) {
    const surveyRef = this.db.collection("surveys").doc();
    await surveyRef.set({
      ...data,
      status: "active",
      totalVotes: 0,
      results: data.options.reduce((acc, _, i) => ({ ...acc, [i]: 0 }), {}),
      createdAt: import_firestore2.FieldValue.serverTimestamp(),
      updatedAt: import_firestore2.FieldValue.serverTimestamp()
    });
    return surveyRef.id;
  }
  async castVote(surveyId, optionIndex, userId) {
    const surveyRef = this.db.collection("surveys").doc(surveyId);
    return this.db.runTransaction(async (transaction) => {
      const surveySnap = await transaction.get(surveyRef);
      if (!surveySnap.exists) throw new Error("Survey not found");
      const surveyData = surveySnap.data();
      if (surveyData?.status !== "active") throw new Error("Survey is not active");
      transaction.update(surveyRef, {
        [`results.${optionIndex}`]: import_firestore2.FieldValue.increment(1),
        totalVotes: import_firestore2.FieldValue.increment(1),
        updatedAt: import_firestore2.FieldValue.serverTimestamp()
      });
      return { success: true };
    });
  }
  async getSurvey(surveyId) {
    const doc = await this.db.collection("surveys").doc(surveyId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
  async listActiveSurveys() {
    const now = /* @__PURE__ */ new Date();
    const snapshot = await this.db.collection("surveys").where("status", "==", "active").where("activeFrom", "<=", now).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((s) => (s.activeTo?.toDate?.() || new Date(s.activeTo)) > now);
  }
};

// src/services/backend/analyticsService.ts
var AnalyticsService = class {
  constructor(db) {
    this.db = db;
  }
  async getSurveyResults(surveyId) {
    const doc = await this.db.collection("surveys").doc(surveyId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;
    const results = data.results || {};
    const totalVotes = data.totalVotes || 0;
    const breakdown = Object.entries(results).map(([idx, count]) => ({
      optionIndex: parseInt(idx),
      optionText: data.options[parseInt(idx)],
      count: Number(count),
      percentage: totalVotes > 0 ? Number(count) / totalVotes * 100 : 0
    }));
    return {
      surveyId: doc.id,
      question: data.question,
      totalVotes,
      breakdown,
      trend: data.trend || "stable",
      lastUpdated: data.updatedAt?.toDate?.() || /* @__PURE__ */ new Date()
    };
  }
  async getGlobalPulse() {
    const activeSurveys = await this.db.collection("surveys").where("status", "==", "active").limit(5).get();
    return activeSurveys.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        totalVotes: data.totalVotes
      };
    });
  }
};

// src/services/backend/notificationService.ts
var import_firestore3 = require("firebase-admin/firestore");
var NotificationService = class {
  constructor(db, messaging) {
    this.db = db;
    this.messaging = messaging;
  }
  async registerToken(userId, token) {
    const tokenRef = this.db.collection("fcm_tokens").doc(token);
    await tokenRef.set({
      userId,
      token,
      updatedAt: import_firestore3.FieldValue.serverTimestamp()
    });
  }
  async broadcast(title, body, data) {
    const snapshot = await this.db.collection("fcm_tokens").get();
    const tokens = snapshot.docs.map((doc) => doc.data().token);
    if (tokens.length === 0) return { success: true, count: 0 };
    const message = {
      notification: { title, body },
      data,
      tokens
    };
    try {
      const response = await this.messaging.sendEachForMulticast(message);
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        if (failedTokens.length > 0) {
          const batch = this.db.batch();
          failedTokens.forEach((t) => {
            batch.delete(this.db.collection("fcm_tokens").doc(t));
          });
          await batch.commit();
        }
      }
      return {
        success: true,
        count: response.successCount,
        failed: response.failureCount
      };
    } catch (error) {
      console.error("FCM Broadcast Error:", error);
      throw error;
    }
  }
};

// server.ts
var import_genai = require("@google/genai");
var firebaseConfig;
try {
  firebaseConfig = JSON.parse(import_fs.default.readFileSync("./firebase-applet-config.json", "utf8"));
} catch (e) {
  console.error("Failed to read firebase-applet-config.json", e);
}
async function startServer() {
  try {
    const app = (0, import_express.default)();
    const PORT = 3e3;
    let adminApp;
    try {
      const apps = (0, import_app.getApps)();
      if (apps.length === 0) {
        if (firebaseConfig?.projectId) {
          console.log("Initializing Firebase Admin with config project:", firebaseConfig.projectId);
          adminApp = (0, import_app.initializeApp)({
            projectId: firebaseConfig.projectId
          });
        } else {
          console.log("No config found, trying default credentials");
          adminApp = (0, import_app.initializeApp)();
        }
      } else {
        adminApp = apps[0];
      }
    } catch (err) {
      console.error("Firebase Admin initialization error:", err);
      return;
    }
    let db;
    const dbId = firebaseConfig?.firestoreDatabaseId;
    try {
      if (dbId) {
        console.log("Using non-default Firestore database:", dbId);
        db = (0, import_firestore4.getFirestore)(adminApp, dbId);
      } else {
        db = (0, import_firestore4.getFirestore)(adminApp);
      }
    } catch (e) {
      console.error("Firestore initialization error:", e);
      db = (0, import_firestore4.getFirestore)(adminApp);
    }
    const messaging = (0, import_messaging.getMessaging)(adminApp);
    const userService = new UserService(db);
    const surveyService = new SurveyService(db);
    const analyticsService = new AnalyticsService(db);
    const notificationService = new NotificationService(db, messaging);
    const ai = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    app.use(import_express.default.json());
    const validateApiKey = async (req, res, next) => {
      const apiKey = req.header("X-Pulse-API-Key");
      if (!apiKey) return res.status(401).json({ error: "API Key missing." });
      try {
        const keyDoc = await db.collection("api_keys").doc(apiKey).get();
        if (!keyDoc.exists || keyDoc.data()?.status !== "active") {
          return res.status(403).json({ error: "Invalid API Key." });
        }
        req.apiKeyInfo = keyDoc.data();
        next();
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    };
    app.get("/api/v1/user/:userId", async (req, res) => {
      const profile = await userService.getUserProfile(req.params.userId);
      if (!profile) return res.status(404).json({ error: "User not found" });
      res.json(profile);
    });
    app.post("/api/v1/pulse/:surveyId/vote", async (req, res) => {
      const { optionIndex, userId } = req.body;
      const { surveyId } = req.params;
      try {
        const voteResult = await surveyService.castVote(surveyId, optionIndex);
        if (userId) {
          await userService.updateParticipation(userId, surveyId);
        }
        res.json(voteResult);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    app.get("/api/v1/pulse/:surveyId/analytics", validateApiKey, async (req, res) => {
      const stats = await analyticsService.getSurveyResults(req.params.surveyId);
      if (!stats) return res.status(404).json({ error: "Survey not found" });
      res.json(stats);
    });
    app.post("/api/v1/notifications/register", async (req, res) => {
      const { userId, token } = req.body;
      await notificationService.registerToken(userId, token);
      res.json({ success: true });
    });
    app.post("/api/v1/admin/broadcast", async (req, res) => {
      const { title, body, secret } = req.body;
      if (secret !== "PULSE_ADMIN_SECRET") return res.status(403).json({ error: "Unauthorized" });
      const result = await notificationService.broadcast(title, body);
      res.json(result);
    });
    app.post("/api/v1/admin/broadcast-survey", async (req, res) => {
      const { surveyId, surveyTitle, secret } = req.body;
      if (secret !== "PULSE_ADMIN_SECRET") return res.status(403).json({ error: "Unauthorized" });
      const result = await notificationService.broadcast(
        "New Pulse: Voice Your Opinion! \u26A1",
        surveyTitle,
        {
          surveyId,
          type: "survey_invite",
          click_action: "FLUTTER_NOTIFICATION_CLICK"
          // For mobile deep links if applicable
        }
      );
      res.json(result);
    });
    app.get("/api/v1/pulse", validateApiKey, async (req, res) => {
      const surveys = await surveyService.listActiveSurveys();
      res.json({ surveys });
    });
    app.get("/api/v1/pulse/:surveyId/results", validateApiKey, async (req, res) => {
      const results = await analyticsService.getSurveyResults(req.params.surveyId);
      if (!results) return res.status(404).json({ error: "Survey not found" });
      res.json(results);
    });
    app.get("/api/v1/pulse/:surveyId/ai-summary", async (req, res) => {
      const { surveyId } = req.params;
      const { lang = "en" } = req.query;
      try {
        const surveyDoc = await db.collection("surveys").doc(surveyId).get();
        if (!surveyDoc.exists) return res.status(404).json({ error: "Survey not found" });
        const surveyData = surveyDoc.data();
        const commentsSnap = await db.collection("surveys").doc(surveyId).collection("comments").orderBy("timestamp", "desc").limit(20).get();
        const comments = commentsSnap.docs.map((doc) => doc.data().comment).filter((t) => typeof t === "string" && t.trim().length > 0).join("\n");
        const languageNames = {
          en: "English",
          pidgin: "Nigerian Pidgin English",
          yoruba: "Yoruba",
          hausa: "Hausa",
          igbo: "Igbo"
        };
        const targetLang = languageNames[lang] || "English";
        const prompt = `Analyze these pulse survey results for a "Nigeria Pulse" app. 
        Question: ${surveyData?.question || "Untitled Survey"}
        Options: ${(surveyData?.options || []).join(", ")}
        Results Breakdown: ${JSON.stringify(surveyData?.results || {})}
        Total Votes Collected: ${surveyData?.totalVotes || 0}
        Recent Participant Comments:
        ${comments || "No comments yet"}

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
              type: import_genai.Type.OBJECT,
              properties: {
                summary: {
                  type: import_genai.Type.STRING,
                  description: "A 2-3 paragraph analysis of the survey results and comments."
                },
                vibe: {
                  type: import_genai.Type.STRING,
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
          const jsonMatch = response.text.match(/```json\s?([\s\S]*?)```/) || response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const cleanJson = jsonMatch[1] || jsonMatch[0];
            res.json(JSON.parse(cleanJson.trim()));
          } else {
            throw new Error("Could not parse AI response as JSON");
          }
        }
      } catch (error) {
        console.error("Gemini error details:", error);
        res.status(500).json({
          error: "Failed to generate AI insights",
          details: error.message || String(error)
        });
      }
    });
    app.get("/api/v1/admin/export/:surveyId", async (req, res) => {
      const { surveyId } = req.params;
      const { apiKey } = req.query;
      const isValidKey = await db.collection("apiKeys").doc(apiKey).get();
      if (!isValidKey.exists) return res.status(403).json({ error: "Invalid API Key" });
      try {
        const votesSnap = await db.collection("surveys").doc(surveyId).collection("votes").get();
        let csv = "timestamp,choice,ageRange,state,deviceType\n";
        votesSnap.docs.forEach((doc) => {
          const v = doc.data();
          const timestamp = v.timestamp?.toDate?.()?.toISOString() || "";
          csv += `${timestamp},"${v.choice}","${v.ageRange || "N/A"}","${v.state || "N/A"}","${v.deviceType || "unknown"}"
`;
        });
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=pulse_export_${surveyId}.csv`);
        res.status(200).send(csv);
      } catch (error) {
        res.status(500).json({ error: "Export failed" });
      }
    });
    app.post("/api/admin/init", async (req, res) => {
      const { email, uid } = req.body;
      if (email !== "davidotu@mixxd.org") return res.status(403).json({ error: "Unauthorized" });
      await db.collection("admins").doc(uid).set({ email, role: "superadmin", updatedAt: import_firestore4.FieldValue.serverTimestamp() });
      res.json({ success: true });
    });
    app.post("/api/v1/admin/keys", async (req, res) => {
      const { secret, ownerEmail } = req.body;
      if (secret !== "PULSE_ADMIN_SECRET") return res.status(403).json({ error: "Unauthorized" });
      try {
        const key = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        await db.collection("api_keys").doc(key).set({
          ownerEmail,
          status: "active",
          createdAt: import_firestore4.FieldValue.serverTimestamp()
        });
        res.json({ success: true, key });
      } catch (error) {
        res.status(500).json({ error: "Failed to generate API Key" });
      }
    });
    app.post("/api/v1/commercial/tts", async (req, res) => {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: `Speak with a warm, professional, and vibrant Nigerian woman's accent, full of pride and clarity: ${text}`,
          config: {
            responseModalities: [import_genai.Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" }
              }
            }
          }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        res.json({ audio: base64Audio });
      } catch (error) {
        console.error("TTS Error:", error);
        res.status(500).json({ error: "Voiceover generation failed" });
      }
    });
    if (process.env.NODE_ENV !== "production") {
      const vite = await (0, import_vite.createServer)({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    } else {
      const distPath = import_path.default.join(process.cwd(), "dist");
      app.use(import_express.default.static(distPath));
      app.get("*", (req, res) => res.sendFile(import_path.default.join(distPath, "index.html")));
    }
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("CRITICAL ERROR:", err);
  }
}
startServer();
//# sourceMappingURL=server.cjs.map
