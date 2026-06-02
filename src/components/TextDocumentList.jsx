export default function TextDocumentList({
  documents,
  selectedId,
  currentUserId,
  onSelect,
  onShare,
  onDelete
}) {
  if (!documents.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No documents yet. Create your first document to start writing.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => {
        const isActive = document.id === selectedId;
        const isOwner = document.owner_id === currentUserId;

        return (
          <button
            key={document.id}
            onClick={() => onSelect(document)}
            className={`w-full rounded-[24px] border p-4 text-left transition ${
              isActive
                ? 'border-teal-300 bg-teal-50/80 shadow-panel'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">{document.name || 'Untitled document'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {isOwner ? 'Owned by you' : 'Shared with you'}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {(document.access_role || 'viewer').toUpperCase()}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
              {toPreviewText(document.content) || 'Empty document'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {onShare && isOwner && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    onShare(document);
                  }}
                  className="rounded-xl border border-teal-200 px-3 py-1.5 text-xs font-medium text-teal-700"
                >
                  Share
                </span>
              )}
              {isOwner && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(document);
                  }}
                  className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                >
                  Delete
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function toPreviewText(value = '') {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
