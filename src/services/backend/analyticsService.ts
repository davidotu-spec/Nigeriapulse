import { Firestore } from 'firebase-admin/firestore';

export class AnalyticsService {
  constructor(private db: Firestore) {}

  async getSurveyResults(surveyId: string) {
    const doc = await this.db.collection('surveys').doc(surveyId).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    if (!data) return null;

    const results = data.results || {};
    const totalVotes = data.totalVotes || 0;

    // Richer analytics: percentage calculation
    const breakdown = Object.entries(results).map(([idx, count]) => ({
      optionIndex: parseInt(idx),
      optionText: data.options[parseInt(idx)],
      count: Number(count),
      percentage: totalVotes > 0 ? (Number(count) / totalVotes) * 100 : 0
    }));

    return {
      surveyId: doc.id,
      question: data.question,
      totalVotes,
      breakdown,
      trend: data.trend || 'stable',
      lastUpdated: data.updatedAt?.toDate?.() || new Date()
    };
  }

  async getGlobalPulse() {
    const activeSurveys = await this.db.collection('surveys')
      .where('status', '==', 'active')
      .limit(5)
      .get();
    
    return activeSurveys.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        totalVotes: data.totalVotes
      };
    });
  }
}
