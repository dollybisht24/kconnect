import { useEffect, useState } from 'react';
import { createDocument } from '../lib/api';
import { createLocalDocument } from '../lib/localDocuments';
import TextDocumentEditor from './TextDocumentEditor';

export default function DocumentBuilderPage({ isLocal, onSignOut }) {
  const [drafts, setDrafts] = useState([
    {
      id: crypto.randomUUID(),
      name: 'Tab 1',
      content: '',
      file: null
    },
    {
      id: crypto.randomUUID(),
      name: 'Tab 2',
      content: '',
      file: null
    }
  ]);
  const [activeDraftId, setActiveDraftId] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const activeDraft = drafts.find((item) => item.id === activeDraftId) || drafts[0];

  useEffect(() => {
    if (!activeDraftId && drafts.length) {
      setActiveDraftId(drafts[0].id);
    }
  }, [activeDraftId, drafts]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateActiveDraft(values) {
    setDrafts((previous) =>
      previous.map((draft) => {
        if (draft.id !== activeDraft.id) {
          return draft;
        }

        return {
          ...draft,
          ...values
        };
      })
    );
  }

  function resetEditor() {
    updateActiveDraft({
      name: `Tab ${drafts.findIndex((item) => item.id === activeDraft.id) + 1}`,
      content: '',
      file: null
    });
  }

  function addTab() {
    const newTab = {
      id: crypto.randomUUID(),
      name: `Tab ${drafts.length + 1}`,
      content: '',
      file: null
    };

    setDrafts((previous) => [...previous, newTab]);
    setActiveDraftId(newTab.id);
  }

  async function handleCreate() {
    setSaving(true);

    const payload = {
      name: activeDraft.name.trim() || 'Untitled document',
      content: activeDraft.content,
      file: activeDraft.file
    };

    const result = isLocal
      ? createLocalDocument({ name: payload.name, content: payload.content })
      : await createDocument(payload);

    if (result?.error) {
      window.alert(result.error);
      setSaving(false);
      return;
    }

    setToast('Document saved. Opening it in dashboard...');
    setSaving(false);

    window.setTimeout(() => {
      window.location.href = `/?doc=${result.id}`;
    }, 450);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_40%,_#ecfeff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Builder Page</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Create Document</h1>
              <p className="mt-2 text-sm text-slate-600">
                This page is only for creating new documents. Use tabs to draft multiple docs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Back to Dashboard
              </a>
              {!isLocal && (
                <button
                  onClick={onSignOut}
                  className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-panel">
          <div className="flex flex-wrap items-center gap-2">
            {drafts.map((draft, index) => {
              const active = draft.id === activeDraft.id;
              return (
                <button
                  key={draft.id}
                  onClick={() => setActiveDraftId(draft.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-teal-300 bg-teal-50 text-teal-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {draft.name?.trim() || `Tab ${index + 1}`}
                </button>
              );
            })}

            <button
              onClick={addTab}
              className="rounded-xl border border-dashed border-slate-400 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              + Add Tab
            </button>
          </div>
        </section>

        <TextDocumentEditor
          name={activeDraft?.name || 'Untitled document'}
          content={activeDraft?.content || ''}
          file={activeDraft?.file || null}
          onNameChange={(value) => updateActiveDraft({ name: value })}
          onContentChange={(value) => updateActiveDraft({ content: value })}
          onFileChange={(value) => updateActiveDraft({ file: value })}
          onSave={handleCreate}
          onNew={resetEditor}
          saving={saving}
          selectedDocument={null}
        />
      </div>

      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-panel">
          {toast}
        </div>
      )}
    </div>
  );
}
