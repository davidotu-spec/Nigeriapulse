import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export class UserService {
  constructor(private db: Firestore) {}

  async getUserProfile(userId: string) {
    const doc = await this.db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  async updateParticipation(userId: string, surveyId: string) {
    const userRef = this.db.collection('users').doc(userId);
    const historyRef = userRef.collection('participation').doc(surveyId);

    return this.db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const historySnap = await transaction.get(historyRef);

      if (historySnap.exists) {
        return { success: false, message: 'Already participated in this survey' };
      }

      const now = new Date();
      const userData = userSnap.data() || {};
      const lastParticipation = userData.lastParticipationAt?.toDate?.() || new Date(0);
      
      // Calculate streak
      let streak = userData.streak || 0;
      const hoursSinceLast = (now.getTime() - lastParticipation.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLast < 48) {
        // Within 2 days, keep/increment streak if it was roughly 24h ago
        // Simplified: if last was yesterday, streak++
        streak += 1;
      } else {
        streak = 1;
      }

      transaction.set(historyRef, {
        surveyId,
        votedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(userRef, {
        points: FieldValue.increment(10),
        streak,
        lastParticipationAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      return { success: true, streak, pointsAwarded: 10 };
    });
  }

  async listParticipatedSurveys(userId: string) {
    const snapshot = await this.db.collection('users').doc(userId).collection('participation')
      .orderBy('votedAt', 'desc')
      .limit(20)
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  }
}
