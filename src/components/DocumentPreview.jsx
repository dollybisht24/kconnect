import { useEffect, useState } from 'react';
import { downloadDocument } from '../lib/api';

export default function DocumentPreview({ document }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    async function loadPreview() {
      if (!document) {
        setPreviewUrl('');
        setError('');
        setLoading(false);
        return;
      }

      const mimeType = (document.mime_type || '').toLowerCase();
      const kind = (document.document_kind || '').toLowerCase();

      if (kind === 'text' || mimeType.startsWith('text/')) {
        setPreviewUrl('');
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const blob = await downloadDocument(document.id);
        objectUrl = URL.createObjectURL(blob);

        if (active) {
          setPreviewUrl(objectUrl);
        }
      } catch (previewError) {
        if (active) {
          setError(previewError.message || 'Preview unavailable for this document.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document]);

  if (!document) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500 shadow-panel">
        Select a document to preview its content here.
      </div>
    );
  }

  const mimeType = (document.mime_type || '').toLowerCase();
  const kind = (document.document_kind || '').toLowerCase();
  const isTextDocument = kind === 'text' || mimeType.startsWith('text/');
  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType.includes('pdf');

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">File Preview</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{document.name}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {document.mime_type || 'Unknown type'} • {(document.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {(document.access_role || 'viewer').toUpperCase()}
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {loading && <p className="p-4 text-sm text-slate-500">Loading preview...</p>}

        {!loading && error && <p className="p-4 text-sm text-amber-700">{error}</p>}

        {!loading && !error && isTextDocument && (
          <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap break-words p-4 text-sm leading-6 text-slate-700">
            {stripHtml(document.content || '') || 'No preview content available.'}
          </pre>
        )}

        {!loading && !error && previewUrl && isImage && (
          <img
            src={previewUrl}
            alt={document.name}
            className="max-h-[340px] w-full object-contain"
          />
        )}

        {!loading && !error && previewUrl && isPdf && (
          <iframe
            title={document.name}
            src={previewUrl}
            className="h-[340px] w-full border-0"
          />
        )}

        {!loading && !error && previewUrl && !isImage && !isPdf && (
          <div className="p-4 text-sm text-slate-600">
            Preview is not available for this file type. Use download to open the document locally.
          </div>
        )}
      </div>
    </div>
  );
}

function stripHtml(value = '') {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
