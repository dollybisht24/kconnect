import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthPanel() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }
    setLoading(true);
    setMessage('');

    const action =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(mode === 'signin' ? 'Signed in successfully.' : 'Check your email to confirm signup.');
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-panel backdrop-blur">
      <h2 className="text-2xl font-semibold text-ink">Document Manager</h2>
      <p className="mt-1 text-sm text-slate-500">Sign in to access your secure dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand/40 transition focus:ring"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand/40 transition focus:ring"
          required
        />
        <button
          disabled={loading}
          className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="mt-4 text-sm font-medium text-brand"
      >
        {mode === 'signin' ? 'New here? Create account' : 'Already have an account? Sign in'}
      </button>

      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
