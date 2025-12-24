import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createProposal, generateProposal, getProposal, updateProposal } from '../services/proposals.js';

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      {children}
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export default function ProposalForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [busyGenerate, setBusyGenerate] = useState(false);

  const [form, setForm] = useState({
    client_name: '',
    client_requirements: '',
    scope_of_work: '',
    timeline: '',
    pricing: '',
    status: 'draft',
  });

  const canSubmit = useMemo(() => {
    return form.client_name.trim() && form.scope_of_work.trim();
  }, [form.client_name, form.scope_of_work]);

  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProposal(id);
        setForm({
          client_name: data.client_name || '',
          client_requirements: data.client_requirements || '',
          scope_of_work: data.scope_of_work || '',
          timeline: data.timeline || '',
          pricing: data.pricing || '',
          status: data.status || 'draft',
        });
      } catch (e) {
        setError(e?.response?.data?.error || e.message || 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isEdit) {
        const saved = await updateProposal(id, form);
        navigate(`/dashboard/proposals/${saved.id}`);
      } else {
        const saved = await createProposal(form);
        navigate(`/dashboard/proposals/${saved.id}`);
      }
    } catch (e2) {
      setError(e2?.response?.data?.errors?.join(', ') || e2?.response?.data?.error || e2.message);
    }
  };

  const onGenerate = async () => {
    if (!isEdit) {
      setError('Save the proposal first, then generate.');
      return;
    }

    setBusyGenerate(true);
    setError('');

    try {
      const result = await generateProposal(id);
      const generatedId = result?.generated_proposal?.id;
      if (generatedId) {
        navigate(`/dashboard/proposals/${id}/generated/${generatedId}`);
      }
    } catch (e) {
      setError(e?.response?.data?.details || e?.response?.data?.error || e.message);
    } finally {
      setBusyGenerate(false);
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isEdit ? 'Edit Proposal' : 'New Proposal'}
          </h1>
          <p className="text-sm text-slate-600">Fill the structured inputs. AI will generate the full academic template.</p>
        </div>
        <Link to="/dashboard/proposals" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
          ← Back to history
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      <form onSubmit={onSave} className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Client Name" hint="Required">
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.client_name}
              onChange={set('client_name')}
              placeholder="e.g., Department of Computer Science"
            />
          </Field>

          <Field label="Status">
            <select
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.status}
              onChange={set('status')}
            >
              <option value="draft">draft</option>
              <option value="generated">generated</option>
              <option value="completed">completed</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Scope of Work" hint="Required. Keep it clear and specific.">
              <textarea
                className="min-h-[110px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.scope_of_work}
                onChange={set('scope_of_work')}
                placeholder="Describe what will be built (modules, features, deliverables)."
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Project Requirements" hint="Optional, but improves AI quality.">
              <textarea
                className="min-h-[110px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.client_requirements}
                onChange={set('client_requirements')}
                placeholder="Constraints, academic template rules, must-have sections, etc."
              />
            </Field>
          </div>

          <Field label="Timeline">
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.timeline}
              onChange={set('timeline')}
              placeholder="e.g., 7th–8th semester (12 weeks)"
            />
          </Field>

          <Field label="Pricing / Budget">
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.pricing}
              onChange={set('pricing')}
              placeholder="e.g., PKR 0 (FYP) or 1000 USD"
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isEdit ? 'Save Changes' : 'Create Proposal'}
          </button>

          <button
            type="button"
            onClick={onGenerate}
            disabled={!isEdit || busyGenerate}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {busyGenerate ? 'Generating…' : 'Generate with AI'}
          </button>
        </div>

        {!isEdit ? (
          <div className="mt-3 text-xs text-slate-500">
            After creating, you’ll be redirected to edit mode where you can generate.
          </div>
        ) : null}
      </form>
    </div>
  );
}
