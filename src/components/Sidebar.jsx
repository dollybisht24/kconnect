export default function Sidebar({ currentView, onViewChange, onSignOut, userEmail }) {
  const items = [
    { id: 'all', label: 'All Documents', hint: 'Everything you can open and edit' },
    { id: 'owned', label: 'My Documents', hint: 'Documents you created' },
    { id: 'shared', label: 'Shared With Me', hint: 'Documents another user shared' }
  ];

  return (
    <aside className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200 bg-[#0f172a] p-5 text-white shadow-panel">
      <div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-200">Kconnect</p>
          <h1 className="mt-3 text-2xl font-bold">Document Hub</h1>
          <p className="mt-2 text-sm text-slate-300">Create, write, share, and delete documents in one place.</p>
        </div>

        <nav className="mt-6 space-y-2">
          {items.map((item) => {
            const active = item.id === currentView;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  active
                    ? 'bg-teal-400/15 text-white ring-1 ring-teal-300/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-slate-400">Signed in as</p>
        <p className="mt-1 break-all text-sm font-medium text-white">{userEmail}</p>
        <button
          onClick={onSignOut}
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
