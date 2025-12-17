import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Field = ({ label, children }) => (
  <div className="py-3">
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
    <div className="mt-1 text-gray-900">{children}</div>
  </div>
);

const ProfileView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/v1/user_profile');
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.error || 'Failed to load profile');
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
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <Link className="text-blue-600 hover:text-blue-500 font-medium" to="/profile/edit">
            Edit
          </Link>
        </div>

        {loading && <p className="mt-6 text-gray-600">Loading…</p>}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {!loading && !error && !data && (
          <div className="mt-6 rounded-xl border bg-white p-6">
            <p className="text-gray-700">No profile found yet.</p>
            <Link className="mt-3 inline-block text-blue-600 hover:text-blue-500 font-medium" to="/profile/edit">
              Create your profile
            </Link>
          </div>
        )}

        {!loading && !error && data && (
          <div className="mt-6 bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{data.full_name || '—'}</h2>
                  <p className="mt-1 text-gray-700">{data.headline || data.job_title || '—'}</p>
                  {data.company && <p className="mt-1 text-sm text-gray-600">{data.company}</p>}
                </div>

                {data.profile_image_url && (
                  <img
                    src={data.profile_image_url}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                )}
              </div>
            </div>

            <div className="p-6 divide-y">
              <Field label="First name">{data.first_name || '—'}</Field>
              <Field label="Last name">{data.last_name || '—'}</Field>
              <Field label="Job title">{data.job_title || '—'}</Field>
              <Field label="Location">{data.location || '—'}</Field>

              <Field label="Website">
                {data.website ? (
                  <a className="text-blue-600 hover:text-blue-500" href={data.website} target="_blank" rel="noreferrer">
                    {data.website}
                  </a>
                ) : (
                  '—'
                )}
              </Field>

              <Field label="LinkedIn">
                {data.linkedin_url ? (
                  <a className="text-blue-600 hover:text-blue-500" href={data.linkedin_url} target="_blank" rel="noreferrer">
                    {data.linkedin_url}
                  </a>
                ) : (
                  '—'
                )}
              </Field>

              <Field label="Summary">
                {data.summary ? <p className="whitespace-pre-wrap">{data.summary}</p> : '—'}
              </Field>

              <Field label="Skills">
                {Array.isArray(data.skills) && data.skills.length ? (
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </Field>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
