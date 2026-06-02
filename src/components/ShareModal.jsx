import { useEffect, useState } from 'react';

export default function ShareModal({ document, onClose, onSubmit, loading }) {
	const [email, setEmail] = useState('');
	const [accessRole, setAccessRole] = useState('viewer');

	useEffect(() => {
		setEmail('');
		setAccessRole('viewer');
	}, [document]);

	if (!document) {
		return null;
	}

	async function handleSubmit(event) {
		event.preventDefault();
		await onSubmit(email, accessRole);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Share Document</p>
						<h2 className="mt-2 text-2xl font-bold text-slate-900">{document.name}</h2>
						<p className="mt-2 text-sm text-slate-500">
							Send access to another user by email. They will see the file in their shared view.
						</p>
					</div>
					<button onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500">
						Close
					</button>
				</div>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<label className="block text-sm font-medium text-slate-700">
						Recipient Email
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="person@company.com"
							className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-teal-200 transition focus:ring"
							required
						/>
					</label>

					<label className="block text-sm font-medium text-slate-700">
						Access Role
						<select
							value={accessRole}
							onChange={(event) => setAccessRole(event.target.value)}
							className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-teal-200 transition focus:ring"
						>
							<option value="viewer">Viewer</option>
							<option value="editor">Editor</option>
						</select>
						<p className="mt-1 text-xs text-slate-500">
							Viewers can read and comment. Editors can also modify shared document content.
						</p>
					</label>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
						>
							Cancel
						</button>
						<button
							disabled={loading}
							className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
						>
							{loading ? 'Sending...' : 'Send Invite'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
