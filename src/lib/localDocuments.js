const STORAGE_KEY = 'kconnect.local.documents';

function readDocuments() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDocuments(documents) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

export function listLocalDocuments() {
  return readDocuments().sort((left, right) => {
    return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
  });
}

export function createLocalDocument({ name, content }) {
  const now = new Date().toISOString();
  const document = {
    id: crypto.randomUUID(),
    name: name || 'Untitled document',
    content: content || '',
    owner_id: 'local-user',
    document_kind: 'text',
    mime_type: 'text/plain',
    size: new Blob([content || '']).size,
    created_at: now,
    updated_at: now,
    shared_with: []
  };

  const documents = listLocalDocuments();
  writeDocuments([document, ...documents]);
  return document;
}

export function updateLocalDocument(id, { name, content }) {
  const now = new Date().toISOString();
  let updated = null;

  const documents = listLocalDocuments().map((document) => {
    if (document.id !== id) {
      return document;
    }

    updated = {
      ...document,
      name: name || document.name,
      content,
      size: new Blob([content || '']).size,
      updated_at: now
    };

    return updated;
  });

  writeDocuments(documents);
  return updated;
}

export function deleteLocalDocument(id) {
  const documents = listLocalDocuments().filter((document) => document.id !== id);
  writeDocuments(documents);
}
