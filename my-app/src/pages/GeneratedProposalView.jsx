import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProposal } from '../services/proposals.js';

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

function ListSection({ title, items }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {items?.length ? (
        <ul className="mt-3 list-inside list-disc text-sm leading-7 text-slate-700">
          {items.map((x, idx) => (
            <li key={idx}>{x}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">—</p>
      )}
    </section>
  );
}

export default function GeneratedProposalView() {
  const { id, generatedId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProposal(id);
        setProposal(data);
      } catch (e) {
        setError(e?.response?.data?.error || e.message || 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="text-slate-600">Loading generated proposal…</div>;
  if (error) return <div className="text-red-700">{error}</div>;

  const latest = proposal?.latest_generated_proposal;

  // small convenience: if the URL generatedId doesn't match the latest one, still show latest
  // (backend index returns only latest, and show includes latest)
  const gp = latest && String(latest.id) === String(generatedId) ? latest : latest;
  const sections = gp?.content_sections || {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Generated Proposal</h1>
          <p className="text-sm text-slate-600">
            Client: <span className="font-medium text-slate-900">{proposal?.client_name || '—'}</span>
            {gp?.version ? <span className="ml-2 text-slate-400">•</span> : null}
            {gp?.version ? <span className="ml-2 text-slate-600">Version {gp.version}</span> : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/dashboard/proposals/${proposal?.id}`}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit inputs
          </Link>
          <Link
            to="/dashboard/proposals"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to history
          </Link>
        </div>
      </div>

      <Section title="Project Title">{sections.project_title || '—'}</Section>
      <Section title="Introduction">{sections.introduction || '—'}</Section>
      <ListSection title="Objectives" items={sections.objectives} />
      <Section title="Problem Statement">{sections.problem_statement || '—'}</Section>
      <Section title="Proposed System">{sections.proposed_system || '—'}</Section>
      <ListSection title="Main Modules" items={sections.main_modules} />
      <Section title="Expected Outcomes">{sections.expected_outcomes || '—'}</Section>
      <Section title="Tools & Technology">{sections.tools_and_technology || '—'}</Section>
    </div>
  );
}
