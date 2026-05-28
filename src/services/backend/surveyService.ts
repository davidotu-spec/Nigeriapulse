import { Firestore, FieldValue } from 'firebase-admin/firestore';

export class SurveyService {
  constructor(private db: Firestore) {}

  async createSurvey(data: {
    question: string;
    options: string[];
    weekLabel: string;
    activeFrom: Date;
    activeTo: Date;
  }) {
    const surveyRef = this.db.collection('surveys').doc();
    await surveyRef.set({
      ...data,
      status: 'active',
      totalVotes: 0,
      results: data.options.reduce((acc, _, i) => ({ ...acc, [i]: 0 }), {}),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return surveyRef.id;
  }

  async castVote(surveyId: string, optionIndex: number, userId?: string) {
    const surveyRef = this.db.collection('surveys').doc(surveyId);

    return this.db.runTransaction(async (transaction) => {
      const surveySnap = await transaction.get(surveyRef);
      if (!surveySnap.exists) throw new Error('Survey not found');

      const surveyData = surveySnap.data();
      if (surveyData?.status !== 'active') throw new Error('Survey is not active');

      // Atomic increment of the specific option
      transaction.update(surveyRef, {
        [`results.${optionIndex}`]: FieldValue.increment(1),
        totalVotes: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // If userId is provided, we might also record it globally for anonymized analytics
      // But we usually track participation on the user doc instead for privacy/speed
      
      return { success: true };
    });
  }

  async getSurvey(surveyId: string) {
    const doc = await this.db.collection('surveys').doc(surveyId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async listActiveSurveys() {
    const now = new Date();
    const snapshot = await this.db.collection('surveys')
      .where('status', '==', 'active')
      .where('activeFrom', '<=', now)
      .get();
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((s: any) => (s.activeTo?.toDate?.() || new Date(s.activeTo)) > now);
  }
}
