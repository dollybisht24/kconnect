import { useEffect, useState } from 'react';
import { addComment, fetchComments } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

export default function CommentsPanel({ documentId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    let active = true;

    async function loadComments() {
      const data = await fetchComments(documentId);
      if (active) {
        setComments(Array.isArray(data) ? data : []);
      }
    }

    loadComments();

    const channel = supabase
      .channel(`doc-comments-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_comments',
          filter: `document_id=eq.${documentId}`
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  async function submitComment(event) {
    event.preventDefault();
    if (!content.trim()) return;

    const response = await addComment(documentId, content);
    if (response?.error) {
      alert(response.error);
      return;
    }

    setContent('');
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-semibold text-slate-800">Discussion</h4>
      <div className="mt-3 max-h-48 space-y-2 overflow-auto pr-1 text-sm">
        {comments.map((item) => (
          <div key={item.id} className="rounded-lg bg-mist px-3 py-2">
            <p className="text-xs font-medium text-slate-500">{item.user_email}</p>
            <p className="text-slate-700">{item.content}</p>
          </div>
        ))}
        {!comments.length && <p className="text-slate-500">No comments yet.</p>}
      </div>

      <form onSubmit={submitComment} className="mt-3 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white">
          Send
        </button>
      </form>
    </div>
  );
}
