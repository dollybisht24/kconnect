import { useEffect, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import DocumentBuilderPage from './components/DocumentBuilderPage';
import DocumentDashboard from './components/DocumentDashboard';
import LocalDocumentDashboard from './components/LocalDocumentDashboard';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const isBuilderPage = window.location.pathname === '/builder';

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return isBuilderPage ? <DocumentBuilderPage isLocal /> : <LocalDocumentDashboard />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[conic-gradient(from_230deg,_#f8fafc,_#d1fae5,_#fef3c7,_#f8fafc)] p-4">
        <AuthPanel />
      </main>
    );
  }

  if (isBuilderPage) {
    return <DocumentBuilderPage isLocal={false} onSignOut={() => supabase.auth.signOut()} />;
  }

  return <DocumentDashboard session={session} />;
}

export default App;
