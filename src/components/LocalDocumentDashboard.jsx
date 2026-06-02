import { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import TextDocumentEditor from './TextDocumentEditor';
import TextDocumentList from './TextDocumentList';
import {
  createLocalDocument,
  deleteLocalDocument,
  listLocalDocuments,
  updateLocalDocument
} from '../lib/localDocuments';

export default function LocalDocumentDashboard() {
  const [documents, setDocuments] = useState(listLocalDocuments());
  const [currentView, setCurrentView] = useState('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [name, setName] = useState('Untitled document');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectedDocument = documents.find((document) => document.id === selectedDocumentId) || null;

  const stats = useMemo(() => {
    const total = documents.length;
    return { total, own: total, shared: 0 };
  }, [documents]);

  function refreshDocuments(nextSelectedId = selectedDocumentId) {
    const nextDocuments = listLocalDocuments();
    setDocuments(nextDocuments);

    if (!nextDocuments.some((document) => document.id === nextSelectedId)) {
      setSelectedDocumentId('');
      setName('Untitled document');
      setContent('');
      setFile(null);
    }
  }

  useEffect(() => {
    const docId = new URLSearchParams(window.location.search).get('doc');
    if (!docId) {
      return;
    }

    const matched = documents.find((document) => document.id === docId);
    if (matched) {
      handleSelect(matched);
    }

    window.history.replaceState({}, '', '/');
  }, [documents]);

  function handleSelect(document) {
    setSelectedDocumentId(document.id);
    setName(document.name || 'Untitled document');
    setContent(document.content || '');
    setFile(null);
  }

  function handleNew() {
    setSelectedDocumentId('');
    setName('Untitled document');
    setContent('');
    setFile(null);
  }

  async function handleSave() {
    setSaving(true);

    if (selectedDocument) {
      const updated = updateLocalDocument(selectedDocument.id, {
        name: name.trim() || 'Untitled document',
        content
      });
      setSelectedDocumentId(updated.id);
      setName(updated.name);
      setContent(updated.content || '');
      refreshDocuments(updated.id);
    } else {
      const created = createLocalDocument({
        name: name.trim() || 'Untitled document',
        content
      });
      setSelectedDocumentId(created.id);
      setName(created.name);
      setContent(created.content || '');
      refreshDocuments(created.id);
    }

    setSaving(false);
    setFile(null);
  }

  function handleDelete(document) {
    deleteLocalDocument(document.id);
    refreshDocuments(document.id);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_40%,_#ecfeff_100%)] p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onSignOut={handleNew}
          userEmail="Local mode"
        />

        <main className="space-y-6">
          <header className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Local Workspace</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Document Website</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Create a document, write inside it, save your changes, and delete it directly in the browser.
                </p>
              </div>
              <button
                onClick={handleNew}
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
            <StatCard title="Your docs" value={stats.own} />
            <StatCard title="Shared docs" value={stats.shared} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel">
                <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pick a document to edit it, or create a new one.
                </p>
              </div>

              <TextDocumentList
                documents={documents}
                selectedId={selectedDocumentId}
                currentUserId="local-user"
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            </div>

            <TextDocumentEditor
              name={name}
              content={content}
              file={file}
              onNameChange={setName}
              onContentChange={setContent}
              onFileChange={setFile}
              onSave={handleSave}
              onNew={handleNew}
              saving={saving}
              selectedDocument={selectedDocument}
            />
          </section>
        </main>
      </div>
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
