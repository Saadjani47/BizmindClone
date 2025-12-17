import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ success: '', error: '' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/v1/user_profile');
        if (!mounted) return;
        // Assume Rails returns either raw object or {user_profile: {...}}
        setForm(res.data?.user_profile || res.data || {});
      } catch {
        // If profile doesn't exist yet, start with empty form
        if (mounted) setForm({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    const raw = e.target.value;
    const skills = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, skills, skillsText: raw }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ success: '', error: '' });

    try {
      // Backend expects a flat payload (not nested under user_profile)
      const payload = { ...form };
      delete payload.skillsText;

      try {
        await api.put('/api/v1/user_profile', payload);
      } catch (err) {
        // If profile doesn't exist yet, create it.
        if (err?.response?.status === 404) {
          await api.post('/api/v1/user_profile', payload);
        } else {
          throw err;
        }
      }
      setFeedback({ success: 'Profile saved.', error: '' });
      setTimeout(() => navigate('/profile'), 400);
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0] || err?.response?.data?.error || 'Failed to save profile';
      setFeedback({ success: '', error: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-2 text-gray-600">Fill in your profile details.</p>

        {loading ? (
          <p className="mt-6 text-gray-600">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-xl border p-6 space-y-4">
            {feedback.error && <p className="text-sm text-red-600">{feedback.error}</p>}
            {feedback.success && <p className="text-sm text-green-700">{feedback.success}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="first_name"
                value={form.first_name || ''}
                onChange={handleChange}
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="last_name"
                value={form.last_name || ''}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="headline"
                value={form.headline || ''}
                onChange={handleChange}
                placeholder="e.g. Founder @ BizMind"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job title</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="job_title"
                value={form.job_title || ''}
                onChange={handleChange}
                placeholder="Job title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="company"
                value={form.company || ''}
                onChange={handleChange}
                placeholder="Company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="location"
                value={form.location || ''}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="website"
                value={form.website || ''}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="linkedin_url"
                value={form.linkedin_url || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                name="summary"
                value={form.summary || ''}
                onChange={handleChange}
                placeholder="Short bio"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                name="skills"
                value={form.skillsText ?? (Array.isArray(form.skills) ? form.skills.join(', ') : '')}
                onChange={handleSkillsChange}
                placeholder="e.g. Marketing, Sales, Prompting"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                saving ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
              }`}
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        )}
    </div>
  );
};

export default ProfileEdit;
