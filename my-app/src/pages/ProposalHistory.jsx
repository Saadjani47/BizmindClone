import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listProposals, generateProposal } from '../services/proposals.js';

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

export default function ProposalHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [items]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listProposals();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onGenerate = async (id) => {
    setBusyId(id);
    try {
      const result = await generateProposal(id);
      const generatedId = result?.generated_proposal?.id;
      if (generatedId) {
        navigate(`/dashboard/proposals/${id}/generated/${generatedId}`);
      } else {
        // fallback: reload history
        await load();
      }
    } catch (e) {
      setError(e?.response?.data?.details || e?.response?.data?.error || e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading proposal history…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Proposal History</h1>
          <p className="text-sm text-slate-600">All proposals you’ve created.</p>
        </div>
        <Link
          to="/dashboard/proposals/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          New Proposal
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-slate-700">No proposals yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first proposal to start building your history.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">AI</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const latest = p.latest_generated_proposal;
                return (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{p.client_name || '—'}</div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {p.scope_of_work || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.generated ? (
                        <div className="flex items-center gap-2">
                          <Badge>Generated</Badge>
                          {latest?.version ? <span className="text-xs text-slate-500">v{latest.version}</span> : null}
                        </div>
                      ) : (
                        <Badge>Not yet</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/dashboard/proposals/${p.id}`}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </Link>

                        {latest?.id ? (
                          <Link
                            to={`/dashboard/proposals/${p.id}/generated/${latest.id}`}
                            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            View
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onGenerate(p.id)}
                            disabled={busyId === p.id}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {busyId === p.id ? 'Generating…' : 'Generate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
