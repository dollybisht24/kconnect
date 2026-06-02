import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function requireApiConfig() {
	if (!API_URL) {
		throw new Error('VITE_API_URL is not configured.');
	}
}

async function authHeaders(extraHeaders = {}) {
	if (!supabase) {
		throw new Error('Supabase is not configured.');
	}

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return {
		...extraHeaders,
		Authorization: `Bearer ${session?.access_token || ''}`
	};
}

export async function fetchDocuments() {
	requireApiConfig();
	const headers = await authHeaders();
	const response = await fetch(`${API_URL}/api/documents`, { headers });
	return response.json();
}

export async function fetchDocumentAnalytics() {
	requireApiConfig();
	const headers = await authHeaders();
	const response = await fetch(`${API_URL}/api/documents/analytics`, { headers });
	return response.json();
}

export async function createDocument({ name, content, file }) {
	requireApiConfig();
	const headers = await authHeaders();
	const formData = new FormData();
	formData.append('name', name || 'Untitled document');
	formData.append('content', content || '');

	if (file) {
		formData.append('file', file);
	}

	const response = await fetch(`${API_URL}/api/documents/create`, {
		method: 'POST',
		headers,
		body: formData
	});

	return response.json();
}

export async function createTextDocument({ name, content }) {
	requireApiConfig();
	const headers = await authHeaders({ 'Content-Type': 'application/json' });
	const response = await fetch(`${API_URL}/api/documents/text`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ name, content })
	});

	return response.json();
}

export async function updateTextDocument(id, { name, content }) {
	requireApiConfig();
	const headers = await authHeaders({ 'Content-Type': 'application/json' });
	const response = await fetch(`${API_URL}/api/documents/${id}/content`, {
		method: 'PATCH',
		headers,
		body: JSON.stringify({ name, content })
	});

	return response.json();
}

export async function uploadDocument({ file, name, sharePassword }) {
	requireApiConfig();
	const formData = new FormData();
	formData.append('file', file);
	formData.append('name', name || file.name);
	if (sharePassword) {
		formData.append('sharePassword', sharePassword);
	}

	const headers = await authHeaders();
	const response = await fetch(`${API_URL}/api/documents/upload`, {
		method: 'POST',
		headers,
		body: formData
	});

	return response.json();
}

export async function deleteDocument(id) {
	requireApiConfig();
	const headers = await authHeaders();
	const response = await fetch(`${API_URL}/api/documents/${id}`, {
		method: 'DELETE',
		headers
	});

	return response.json();
}

export async function shareDocument(id, email, accessRole = 'viewer') {
	requireApiConfig();
	const headers = await authHeaders({ 'Content-Type': 'application/json' });
	const response = await fetch(`${API_URL}/api/documents/${id}/share`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ email, accessRole })
	});

	return response.json();
}

export async function downloadDocument(id, password) {
	requireApiConfig();
	const headers = await authHeaders();
	const url = new URL(`${API_URL}/api/documents/${id}/download`);

	if (password) {
		url.searchParams.set('password', password);
	}

	const response = await fetch(url, { headers });
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || 'Download failed');
	}

	return response.blob();
}

export async function processDocument(id, action, watermarkText) {
	requireApiConfig();
	const headers = await authHeaders({ 'Content-Type': 'application/json' });
	const response = await fetch(`${API_URL}/api/documents/${id}/process`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ action, watermarkText })
	});

	return response.json();
}

export async function fetchComments(id) {
	requireApiConfig();
	const headers = await authHeaders();
	const response = await fetch(`${API_URL}/api/documents/${id}/comments`, {
		headers
	});
	return response.json();
}

export async function addComment(id, content) {
	requireApiConfig();
	const headers = await authHeaders({ 'Content-Type': 'application/json' });
	const response = await fetch(`${API_URL}/api/documents/${id}/comments`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ content })
	});

	return response.json();
}

export async function updatePasswordProtection(id, password) {
	requireApiConfig();
	const headers = await authHeaders({ 'Content-Type': 'application/json' });
	const response = await fetch(`${API_URL}/api/documents/${id}/password`, {
		method: 'PATCH',
		headers,
		body: JSON.stringify({ password })
	});

	return response.json();
}
