import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { Messaging } from 'firebase-admin/messaging';

export class NotificationService {
  constructor(private db: Firestore, private messaging: Messaging) {}

  async registerToken(userId: string, token: string) {
    // Store token globally or per-user
    // Storing globally for broadcast ease, but linking to user is better for targeting
    const tokenRef = this.db.collection('fcm_tokens').doc(token);
    await tokenRef.set({
      userId,
      token,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  async broadcast(title: string, body: string, data?: Record<string, string>) {
    const snapshot = await this.db.collection('fcm_tokens').get();
    const tokens = snapshot.docs.map(doc => doc.data().token);

    if (tokens.length === 0) return { success: true, count: 0 };

    const message = {
      notification: { title, body },
      data,
      tokens
    };

    try {
      const response = await this.messaging.sendEachForMulticast(message);
      
      // Cleanup invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });

        if (failedTokens.length > 0) {
          const batch = this.db.batch();
          failedTokens.forEach(t => {
            batch.delete(this.db.collection('fcm_tokens').doc(t));
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
      console.error('FCM Broadcast Error:', error);
      throw error;
    }
  }
}
