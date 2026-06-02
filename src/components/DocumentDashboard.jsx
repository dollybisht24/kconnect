import { useEffect, useMemo, useState } from 'react';
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  fetchDocumentAnalytics,
  shareDocument,
  updateTextDocument
} from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import DocumentPreview from './DocumentPreview';
import ShareModal from './ShareModal';
import Sidebar from './Sidebar';
import TextDocumentEditor from './TextDocumentEditor';
import TextDocumentList from './TextDocumentList';

export default function DocumentDashboard({ session }) {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState({ total: 0, own: 0, shared: 0 });
  const [name, setName] = useState('Untitled document');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentView, setCurrentView] = useState('all');
  const [shareTarget, setShareTarget] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [toast, setToast] = useState('');
  const [analytics, setAnalytics] = useState(null);

  const currentUserId = session?.user?.id;
  const selectedDocument = docs.find((doc) => doc.id === selectedDocumentId) || null;
  const canEditSelectedDocument = !selectedDocument || selectedDocument.access_role !== 'viewer';

  const visibleDocuments = useMemo(() => {
    if (currentView === 'owned') {
      return docs.filter((doc) => doc.owner_id === currentUserId);
    }

    if (currentView === 'shared') {
      const userEmail = session?.user?.email || '';
      return docs.filter((doc) => Array.isArray(doc.shared_with) && doc.shared_with.includes(userEmail));
    }

    return docs;
  }, [currentView, currentUserId, docs, session?.user?.email]);

  function updateStatsFromDocs(nextDocs) {
    const userEmail = session?.user?.email || '';
    const ownDocs = nextDocs.filter((doc) => doc.owner_id === currentUserId);
    const sharedDocs = nextDocs.filter(
      (doc) => doc.owner_id !== currentUserId && Array.isArray(doc.shared_with) && doc.shared_with.includes(userEmail)
    );

    setStats({
      total: nextDocs.length,
      own: ownDocs.length,
      shared: sharedDocs.length
    });
  }

  async function loadWorkspaceData() {
    const data = await fetchDocuments();

    if (data?.error) {
      alert(data.error);
      return;
    }

    const nextDocs = Array.isArray(data) ? data : [];
    setDocs(nextDocs);
    updateStatsFromDocs(nextDocs);

    const docId = new URLSearchParams(window.location.search).get('doc');
    if (docId) {
      const matched = nextDocs.find((doc) => doc.id === docId);
      if (matched) {
        handleSelect(matched);
      }
      window.history.replaceState({}, '', '/');
    }

    const analyticsResult = await fetchDocumentAnalytics();
    if (!analyticsResult?.error) {
      setAnalytics(analyticsResult);
    }
  }

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleDelete(documentId) {
    const result = await deleteDocument(documentId);
    if (result?.error) {
      alert(result.error);
      return;
    }

    if (selectedDocumentId === documentId) {
      resetEditor();
    }

    await loadWorkspaceData();
  }

  async function handleShare(email, accessRole) {
    if (!shareTarget) return;

    setShareLoading(true);
    const result = await shareDocument(shareTarget.id, email, accessRole);
    setShareLoading(false);

    if (result?.error) {
      alert(result.error);
      return;
    }

    setShareTarget(null);
    alert('Share link sent via email.');
  }

  function handleSelect(document) {
    setSelectedDocumentId(document.id);
    setName(document.name || 'Untitled document');
    setContent(document.content || '');
    setFile(null);
  }

  function resetEditor() {
    setSelectedDocumentId('');
    setName('Untitled document');
    setContent('');
    setFile(null);
  }

  async function handleCreateDocument() {
    const payload = {
      name: name.trim() || 'Untitled document',
      content,
      file
    };

    return createDocument(payload);
  }

  async function handleSave() {
    if (selectedDocument && !canEditSelectedDocument) {
      alert('This document is view-only and cannot be edited.');
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim() || 'Untitled document',
      content
    };

    const result = selectedDocument
      ? await updateTextDocument(selectedDocument.id, payload)
      : await handleCreateDocument();

    setSaving(false);

    if (result?.error) {
      alert(result.error);
      return;
    }

    await loadWorkspaceData();
    setSelectedDocumentId(result.id);
    setName(result.name || 'Untitled document');
    setContent(result.content || '');
    setFile(null);

    if (!selectedDocument) {
      setToast('Document created successfully.');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_40%,_#ecfeff_100%)] p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onSignOut={signOut}
          userEmail={session.user.email}
        />

        <main className="space-y-6">
          <header className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Workspace</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">{viewHeading(currentView)}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Create documents, write directly in the browser, save changes, share access, and delete documents from one workspace.
                </p>
              </div>
              <button
                onClick={resetEditor}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                New Document
              </button>
              <a
                href="/builder"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Open Builder Page
              </a>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard title="Total docs" value={stats.total} />
            <StatCard title="Owned by you" value={stats.own} />
            <StatCard title="Shared with you" value={stats.shared} />
          </section>

          {analytics && (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Editable docs" value={analytics.editableDocuments || 0} />
              <StatCard title="PDF docs" value={analytics.pdfDocuments || 0} />
              <StatCard title="Comments" value={analytics.totalComments || 0} />
              <StatCard title="Processing" value={analytics.processingDocuments || 0} />
            </section>
          )}

          <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel">
                <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select a document to keep writing, share it, or remove it.
                </p>
              </div>

              <TextDocumentList
                documents={visibleDocuments}
                selectedId={selectedDocumentId}
                currentUserId={currentUserId}
                onSelect={handleSelect}
                onShare={setShareTarget}
                onDelete={(item) => handleDelete(item.id)}
              />
            </div>

            <div className="space-y-6">
              <DocumentPreview document={selectedDocument} />

              <TextDocumentEditor
                name={name}
                content={content}
                file={file}
                onNameChange={setName}
                onContentChange={setContent}
                onFileChange={setFile}
                onSave={handleSave}
                onNew={resetEditor}
                saving={saving}
                selectedDocument={selectedDocument}
              />

              {analytics?.recentDocuments?.length ? (
                <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recent Activity</p>
                  <div className="mt-4 space-y-3">
                    {analytics.recentDocuments.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {item.access_role || 'viewer'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{item.mime_type || 'Unknown file type'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </main>
      </div>

      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-panel">
          {toast}
        </div>
      )}

      <ShareModal
        document={shareTarget}
        onClose={() => setShareTarget(null)}
        onSubmit={handleShare}
        loading={shareLoading}
      />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}

function viewHeading(view) {
  if (view === 'owned') {
    return 'My Documents';
  }

  if (view === 'shared') {
    return 'Shared With Me';
  }

  return 'Document Dashboard';
}
