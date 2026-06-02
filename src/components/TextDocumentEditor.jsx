import { useEffect, useMemo, useRef, useState } from 'react';

export default function TextDocumentEditor({
	name,
	content,
	file,
	onNameChange,
	onContentChange,
	onFileChange,
	onSave,
	onNew,
	saving,
	selectedDocument
}) {
	const editorRef = useRef(null);
	const fileInputRef = useRef(null);
	const [dragActive, setDragActive] = useState(false);
	const [filePreviewUrl, setFilePreviewUrl] = useState('');

	const plainText = useMemo(() => stripHtml(content), [content]);
	const wordCount = useMemo(() => countWords(plainText), [plainText]);
	const charCount = plainText.length;
	const canEdit = selectedDocument ? selectedDocument.access_role !== 'viewer' : true;

	useEffect(() => {
		if (!editorRef.current) {
			return;
		}

		const nextHtml = toEditorHtml(content);
		if (normalizeHtml(editorRef.current.innerHTML) !== normalizeHtml(nextHtml)) {
			editorRef.current.innerHTML = nextHtml;
		}
	}, [content]);

	useEffect(() => {
		if (!file) {
			setFilePreviewUrl('');
			return undefined;
		}

		const nextUrl = URL.createObjectURL(file);
		setFilePreviewUrl(nextUrl);

		return () => URL.revokeObjectURL(nextUrl);
	}, [file]);

	function runCommand(command, value = null) {
		if (!editorRef.current || !canEdit) {
			return;
		}

		editorRef.current.focus();
		document.execCommand(command, false, value);
		onContentChange(editorRef.current.innerHTML);
	}

	function handleInsertLink() {
		const url = window.prompt('Enter link URL (https://...)');
		if (!url) {
			return;
		}

		runCommand('createLink', url);
	}

	function handleInput(event) {
		onContentChange(event.currentTarget.innerHTML);
	}

	function handleFileSelection(event) {
		onFileChange(event.target.files?.[0] || null);
	}

	function handleDrop(event) {
		event.preventDefault();
		event.stopPropagation();
		setDragActive(false);
		if (!canEdit) {
			return;
		}

		const droppedFile = event.dataTransfer.files?.[0] || null;
		if (droppedFile) {
			onFileChange(droppedFile);
		}
	}

	function handleDragOver(event) {
		event.preventDefault();
		if (canEdit) {
			setDragActive(true);
		}
	}

	function handleDragLeave() {
		setDragActive(false);
	}

	function openFilePicker() {
		fileInputRef.current?.click();
	}

	return (
		<section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-panel">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Editor</p>
					<h3 className="mt-2 text-2xl font-bold text-slate-900">
						{selectedDocument ? 'Edit Document' : 'Create Document'}
					</h3>
					<p className="mt-2 text-sm text-slate-500">
						Write directly in the browser and save the document to your workspace.
					</p>
				</div>

				<div className="flex gap-3">
					<button
						onClick={onNew}
						className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
					>
						New Document
					</button>
					<button
						onClick={onSave}
						disabled={saving || !canEdit}
						className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
					>
						{saving && (
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
						)}
						{!canEdit && selectedDocument ? 'Read Only' : saving ? 'Saving...' : selectedDocument ? 'Save Changes' : 'Create Document'}
					</button>
				</div>
			</div>

			{!canEdit && selectedDocument && (
				<div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
					This document is shared with view-only access. You can preview it, but editing is disabled.
				</div>
			)}

			<div className="mt-6 space-y-4">
				<label className="block text-sm font-medium text-slate-700">
					Document Title
					<input
						type="text"
						value={name}
						onChange={(event) => onNameChange(event.target.value)}
						disabled={!canEdit}
						placeholder="Untitled document"
						className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-teal-200 transition focus:ring disabled:cursor-not-allowed disabled:bg-slate-100"
					/>
				</label>

				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`rounded-2xl border-2 border-dashed px-4 py-4 transition ${
						dragActive && canEdit
							? 'border-teal-400 bg-teal-50'
							: 'border-slate-300 bg-white'
						}`}
				>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-sm font-medium text-slate-700">Optional File Upload</p>
							<p className="mt-1 text-xs text-slate-500">
								Drag and drop a file here or choose one from your device.
							</p>
						</div>
						<button
							type="button"
							onClick={openFilePicker}
							disabled={!canEdit}
							className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Choose File
						</button>
					</div>
					<input ref={fileInputRef} type="file" onChange={handleFileSelection} className="hidden" disabled={!canEdit} />
					<p className="mt-3 text-xs text-slate-500">
						{file ? `Selected file: ${file.name}` : 'No file selected'}
					</p>
					{filePreviewUrl && (
						<div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
							{file.type.startsWith('image/') && (
								<img src={filePreviewUrl} alt={file.name} className="max-h-64 w-full object-contain" />
							)}
							{file.type === 'application/pdf' && (
								<iframe title={file.name} src={filePreviewUrl} className="h-72 w-full border-0" />
							)}
							{!file.type.startsWith('image/') && file.type !== 'application/pdf' && (
								<div className="p-4 text-sm text-slate-600">
									File selected. A detailed preview is not available for this type.
								</div>
							)}
						</div>
					)}
				</div>

				<div className="rounded-2xl border border-slate-300 bg-white">
					{canEdit && (
						<div className="flex flex-wrap gap-2 border-b border-slate-200 p-3">
							<ToolbarButton label="B" title="Bold" onClick={() => runCommand('bold')} />
							<ToolbarButton label="I" title="Italic" onClick={() => runCommand('italic')} />
							<ToolbarButton label="U" title="Underline" onClick={() => runCommand('underline')} />
							<ToolbarButton label="H1" title="Heading" onClick={() => runCommand('formatBlock', '<h1>')} />
							<ToolbarButton label="P" title="Paragraph" onClick={() => runCommand('formatBlock', '<p>')} />
							<ToolbarButton label="• List" title="Bullet list" onClick={() => runCommand('insertUnorderedList')} />
							<ToolbarButton label="1. List" title="Number list" onClick={() => runCommand('insertOrderedList')} />
							<ToolbarButton label="Quote" title="Blockquote" onClick={() => runCommand('formatBlock', '<blockquote>')} />
							<ToolbarButton label="Link" title="Insert link" onClick={handleInsertLink} />
							<ToolbarButton label="Undo" title="Undo" onClick={() => runCommand('undo')} />
							<ToolbarButton label="Redo" title="Redo" onClick={() => runCommand('redo')} />
						</div>
					)}

					<div
						ref={editorRef}
						suppressContentEditableWarning
						contentEditable={canEdit}
						onInput={canEdit ? handleInput : undefined}
						className={`doc-editor min-h-[420px] w-full rounded-b-2xl px-4 py-3 text-sm leading-7 text-slate-800 outline-none ${
							canEdit ? '' : 'bg-slate-50'
						}`}
						data-placeholder="Start writing here..."
					/>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
					<span>{wordCount} words</span>
					<span>{charCount} characters</span>
					<span>Tip: Use Ctrl/Cmd + B, I, U for quick formatting</span>
				</div>
			</div>
		</section>
	);
}

function ToolbarButton({ label, title, onClick }) {
	return (
		<button
			type="button"
			title={title}
			onClick={onClick}
			className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
		>
			{label}
		</button>
	);
}

function toEditorHtml(value) {
	if (!value) {
		return '';
	}

	if (/<\/?[a-z][\s\S]*>/i.test(value)) {
		return value;
	}

	return escapeHtml(value).replace(/\n/g, '<br>');
}

function stripHtml(value) {
	return value
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function countWords(value) {
	if (!value) {
		return 0;
	}

	return value.split(/\s+/).filter(Boolean).length;
}

function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function normalizeHtml(value) {
	return value.replace(/\s+/g, ' ').trim();
}
