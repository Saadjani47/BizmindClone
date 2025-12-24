import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create proposals, generate structured documents with AI, and keep your proposal history.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/dashboard/proposals/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create a proposal
          </Link>
          <Link
            to="/dashboard/proposals"
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View history
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Proposal workflow</div>
          <ol className="mt-2 list-inside list-decimal text-sm text-slate-600">
            <li>Fill client inputs (scope, requirements, timeline).</li>
            <li>Generate AI proposal (structured sections).</li>
            <li>Review, edit, export later.</li>
          </ol>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Tip</div>
          <p className="mt-2 text-sm text-slate-600">
            The generator is idempotent: if you don’t change the inputs, it won’t spend credits regenerating.
            Use “force” regeneration when you want a different variant.
          </p>
        </div>
      </div>
    </div>
  );
}
