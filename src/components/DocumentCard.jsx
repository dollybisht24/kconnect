import CommentsPanel from './CommentsPanel';

export default function DocumentCard({
  document,
  currentUserId,
  processing,
  onDownload,
  onShare,
  onDelete,
  onProcess,
  onPassword
}) {
  const isOwner = document.owner_id === currentUserId;
  const fileType = getFileTypeLabel(document);

  return (
    <article className="flex h-full flex-col rounded-[26px] border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
            {fileType}
          </div>

          <div>
          <h3 className="text-lg font-semibold text-slate-900">{document.name}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {(document.size / 1024).toFixed(2)} KB • {document.mime_type}
          </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isOwner ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
          }`}
        >
          {isOwner ? 'Owner' : 'Shared'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {isOwner ? 'Owned by you' : 'Shared with you'}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {isOwner ? 'You can manage this file directly' : 'This file was added by another user'}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ActionButton onClick={() => onDownload(document)} label="Download" />
        <ActionButton onClick={() => onShare(document)} label="Share" variant="brand" />
        <ActionButton onClick={() => onDelete(document)} label="Delete" variant="danger" />
        {isOwner && (
          <ActionButton
            onClick={() => onProcess(document, 'extract')}
            label={processing ? 'Extracting...' : 'Extract Text'}
          />
        )}
        {isOwner && (
          <ActionButton
            onClick={() => onProcess(document, 'summarize')}
            label={processing ? 'Summarizing...' : 'AI Summary'}
            variant="signal"
          />
        )}
        {isOwner && (
          <ActionButton
            onClick={() => onProcess(document, 'watermark')}
            label={processing ? 'Watermarking...' : 'Watermark'}
          />
        )}
        {isOwner && <ActionButton onClick={() => onPassword(document)} label="Password" />}
      </div>

      {document.is_processing && (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Processing with PDF.co and AI, please wait...
        </p>
      )}

      {document.ai_summary && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">AI Summary</h4>
          <p className="mt-2 text-sm leading-6 text-slate-700">{document.ai_summary}</p>
        </div>
      )}

      <div className="mt-4 flex-1">
        <CommentsPanel documentId={document.id} />
      </div>
    </article>
  );
}

function ActionButton({ onClick, label, variant = 'default' }) {
  const styles = {
    default: 'border-slate-300 text-slate-700 hover:bg-slate-50',
    brand: 'border-teal-300 text-teal-700 hover:bg-teal-50',
    danger: 'border-red-300 text-red-600 hover:bg-red-50',
    signal: 'border-orange-300 text-orange-600 hover:bg-orange-50'
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

function getFileTypeLabel(document) {
  const mimeType = (document.mime_type || '').toLowerCase();
  const fileName = (document.name || '').toLowerCase();

  if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
    return 'PDF';
  }

  if (mimeType.includes('image')) {
    return 'IMG';
  }

  if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return 'DOC';
  }

  if (mimeType.includes('sheet') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    return 'XLS';
  }

  if (mimeType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
    return 'PPT';
  }

  return 'FILE';
}
