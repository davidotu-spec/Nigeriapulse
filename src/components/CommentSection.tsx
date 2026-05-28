import React, { useEffect, useState } from 'react';
import { 
  db, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  handleFirestoreError, 
  OperationType,
  addDoc,
  serverTimestamp,
  auth
} from '../lib/firebase';
import { useSurvey } from '../context/SurveyContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Quote, CornerDownRight, Send } from 'lucide-react';

interface Comment {
  id: string;
  comment: string;
  optionIndex: number;
  timestamp: any;
}

interface Reply {
  id: string;
  comment: string;
  timestamp: any;
  authorId?: string;
  authorEmail?: string;
}

function CommentCard({ 
  c, 
  optionText, 
  delayIndex, 
  surveyId 
}: { 
  key?: React.Key;
  c: Comment; 
  optionText: string; 
  delayIndex: number; 
  surveyId: string;
}) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const repliesRef = collection(db, 'surveys', surveyId, 'comments', c.id, 'replies');
    const q = query(repliesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reply));
      setReplies(docs);
      setLoadingReplies(false);
    }, (error) => {
      console.error("Error loading replies:", error);
      setLoadingReplies(false);
    });

    return () => unsubscribe();
  }, [surveyId, c.id]);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const repliesRef = collection(db, 'surveys', surveyId, 'comments', c.id, 'replies');
      const payload: any = {
        comment: replyText.trim(),
        timestamp: serverTimestamp(),
      };
      if (auth.currentUser) {
        payload.authorId = auth.currentUser.uid;
        payload.authorEmail = auth.currentUser.email || '';
      }
      await addDoc(repliesRef, payload);
      setReplyText('');
    } catch (err) {
      console.error("Failed to add reply:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getAuthorLabel = (reply: Reply) => {
    if (reply.authorEmail) {
      const parts = reply.authorEmail.split('@');
      const name = parts[0];
      const masked = name.length > 3 ? `${name.substring(0, 3)}***` : `${name}***`;
      return `${masked} (Member)`;
    }
    return "Anonymous";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delayIndex * 0.05 }}
      className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 md:p-8 relative group overflow-hidden flex flex-col justify-between h-fit hover:shadow-2xs transition-shadow"
    >
      <Quote className="absolute -top-4 -left-4 h-20 w-20 text-slate-200 opacity-20 pointer-events-none" />
      
      <div className="relative z-10 w-full">
        <p className="text-slate-700 font-medium leading-relaxed mb-6">
          "{c.comment}"
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-auto border-t border-slate-100/50 pt-4 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white border border-slate-200/80 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[200px]">
               {optionText}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">
              {c.timestamp ? new Date(c.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </span>
          </div>

          <button
            id={`toggle-replies-${c.id}`}
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs font-bold text-nigeria-green hover:text-emerald-700 transition-colors flex items-center gap-1.5 focus:outline-none"
          >
            <MessageSquare size={14} />
            {replies.length > 0 ? `${replies.length} replies` : 'Reply'}
          </button>
        </div>

        {/* Collapsible Replies Section */}
        <AnimatePresence>
          {showReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 border-t border-slate-150 pt-4 overflow-hidden"
            >
              {loadingReplies ? (
                <div className="flex justify-center py-4">
                  <div className="w-4 h-4 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                  {replies.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic font-medium pl-3">No replies yet. Be the first to reply!</p>
                  ) : (
                    replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2.5 items-start pl-2">
                        <CornerDownRight size={14} className="text-slate-300 mt-1 shrink-0" />
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 flex-1 min-w-0 shadow-3xs">
                          <p className="text-slate-700 text-xs leading-relaxed font-normal">
                            {reply.comment}
                          </p>
                          <div className="flex justify-between items-center mt-2.5 border-t border-slate-50/50 pt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className={reply.authorEmail ? "text-emerald-600 font-black" : "text-slate-400"}>
                              {getAuthorLabel(reply)}
                            </span>
                            <span className="font-mono font-medium">
                              {reply.timestamp ? new Date(reply.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Inline Reply Input Form */}
              <form onSubmit={handleAddReply} className="flex gap-2 mt-2 items-end">
                <input
                  id={`input-reply-${c.id}`}
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value.substring(0, 1000))}
                  placeholder={auth.currentUser ? "Reply as Member..." : "Reply anonymously..."}
                  className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-nigeria-green flex-1 shadow-3xs min-w-0"
                  maxLength={100}
                  disabled={submitting}
                />
                <button
                  id={`submit-reply-${c.id}`}
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="bg-slate-900 text-white rounded-2xl p-2 hover:bg-emerald-600 active:scale-95 transition-all text-xs disabled:opacity-40 disabled:hover:bg-slate-900 shrink-0 flex items-center justify-center w-8 h-8 focus:outline-none"
                >
                  <Send size={12} className={submitting ? 'animate-pulse' : ''} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function CommentSection() {
  const { currentSurvey } = useSurvey();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSurvey) return;

    const q = query(
      collection(db, 'surveys', currentSurvey.id, 'comments'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'surveys/ANY/comments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentSurvey]);

  if (!currentSurvey) return null;

  return (
    <div id="public-voice-section" className="mt-10 md:mt-16 border-t border-slate-100 pt-10 md:pt-16">
      <div className="flex items-center gap-3 mb-6 md:mb-10">
        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Public Voice</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time National Thoughts</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-slate-50 rounded-[32px] p-6 md:p-10 text-center border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Observation Chamber</p>
           <p className="text-slate-500 italic">No comments have been registered for this pulse yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <AnimatePresence>
            {comments.map((c, i) => {
              const optionText = currentSurvey.options[c.optionIndex] || `Pulse Option #${c.optionIndex + 1}`;
              return (
                <CommentCard
                  key={c.id}
                  c={c}
                  optionText={optionText}
                  delayIndex={i}
                  surveyId={currentSurvey.id}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

