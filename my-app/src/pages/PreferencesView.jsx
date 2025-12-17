import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Field = ({ label, children }) => (
  <div className="py-3">
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
    <div className="mt-1 text-gray-900">{children}</div>
  </div>
);

const pretty = (val) => {
  if (!val) return '—';
  return String(val)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const PreferencesView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/v1/user_preference');
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        if (!mounted) return;
        // If preferences don't exist yet, show a friendly empty state
        if (e?.response?.status === 404) {
          setData(null);
          setError('');
        } else {
          setError(e?.response?.data?.error || 'Failed to load preferences');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <Link className="text-blue-600 hover:text-blue-500 font-medium" to="/preferences/edit">
            Edit
          </Link>
        </div>

        {loading && <p className="mt-6 text-gray-600">Loading…</p>}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {!loading && !error && !data && (
          <div className="mt-6 rounded-xl border bg-white p-6">
            <p className="text-gray-700">No preferences found yet.</p>
            <p className="mt-1 text-sm text-gray-600">
              Click <span className="font-medium">Edit</span> to create your preferences.
            </p>
            <Link className="mt-3 inline-block text-blue-600 hover:text-blue-500 font-medium" to="/preferences/edit">
              Create preferences
            </Link>
          </div>
        )}

        {!loading && !error && data && (
          <div className="mt-6 bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-semibold text-gray-900">Your Preferences</h2>
              <p className="mt-1 text-sm text-gray-600">These settings personalize your BizMind AI experience.</p>
            </div>

            <div className="p-6 divide-y">
              <Field label="Theme">{pretty(data.theme)}</Field>
              <Field label="Language">{pretty(data.language)}</Field>
              <Field label="Industry">{pretty(data.industry)}</Field>
              <Field label="Niche">{pretty(data.niche)}</Field>
              <Field label="Template style">{pretty(data.template_style)}</Field>
              <Field label="Tone of voice">{pretty(data.tone_of_voice)}</Field>
              <Field label="Default output format">{pretty(data.default_output_format)}</Field>

              <Field label="Branding">
                {data.branding && Object.keys(data.branding || {}).length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Primary</div>
                      <div className="mt-1 text-gray-900">{data.branding.primary || '—'}</div>
                    </div>
                    <div className="rounded-lg border bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Secondary</div>
                      <div className="mt-1 text-gray-900">{data.branding.secondary || '—'}</div>
                    </div>
                    <div className="rounded-lg border bg-gray-50 p-3 sm:col-span-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Logo URL</div>
                      <div className="mt-1 text-gray-900 break-all">
                        {data.branding.logo_url ? (
                          <a
                            className="text-blue-600 hover:text-blue-500"
                            href={data.branding.logo_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {data.branding.logo_url}
                          </a>
                        ) : (
                          '—'
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">—</p>
                )}
              </Field>

              <Field label="Other">
                {data.other && Object.keys(data.other || {}).length ? (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="min-w-full divide-y">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Key</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {Object.entries(data.other).map(([k, v]) => (
                          <tr key={k}>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">{k}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{String(v ?? '')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-700">—</p>
                )}
              </Field>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesView;
