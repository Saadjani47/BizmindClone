import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (en)' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'de', label: 'German (de)' },
  { value: 'zh', label: 'Chinese (zh)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ru', label: 'Russian (ru)' },
  { value: 'ar', label: 'Arabic (ar)' },
  { value: 'pt', label: 'Portuguese (pt)' },
  { value: 'hi', label: 'Hindi (hi)' },
];

const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'real_estate', label: 'Real estate' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'legal', label: 'Legal' },
  { value: 'non_profit', label: 'Non-profit' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

const NICHE_OPTIONS = [
  { value: 'ai_startups', label: 'AI startups' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'freelancing', label: 'Freelancing' },
  { value: 'blogging', label: 'Blogging' },
  { value: 'digital_marketing', label: 'Digital marketing' },
  { value: 'health_and_wellness', label: 'Health & wellness' },
  { value: 'personal_finance', label: 'Personal finance' },
  { value: 'education_technology', label: 'Education technology' },
  { value: 'real_estate_investment', label: 'Real estate investment' },
  { value: 'travel_and_tourism', label: 'Travel & tourism' },
  { value: 'food_and_beverage', label: 'Food & beverage' },
  { value: 'fashion_and_beauty', label: 'Fashion & beauty' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'environmental_sustainability', label: 'Environmental sustainability' },
  { value: 'other', label: 'Other' },
];

const TEMPLATE_STYLE_OPTIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Professional' },
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'creative', label: 'Creative' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'bold', label: 'Bold' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'sleek', label: 'Sleek' },
  { value: 'simple', label: 'Simple' },
  { value: 'colorful', label: 'Colorful' },
  { value: 'monochrome', label: 'Monochrome' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'informative', label: 'Informative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'optimistic', label: 'Optimistic' },
];

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
];

const PreferencesEdit = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [otherRows, setOtherRows] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ success: '', error: '' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/v1/user_preference');
        if (!mounted) return;
        const pref = res.data?.user_preference || res.data || {};
        setForm(pref);

        const existingOther = pref?.other && typeof pref.other === 'object' ? pref.other : {};
        const rows = Object.entries(existingOther).map(([k, v]) => ({ key: k, value: String(v ?? '') }));
        setOtherRows(rows.length ? rows : [{ key: '', value: '' }]);
      } catch {
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOtherRowChange = (idx, field) => (e) => {
    const value = e.target.value;
    setOtherRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const addOtherRow = () => setOtherRows((prev) => [...prev, { key: '', value: '' }]);
  const removeOtherRow = (idx) => setOtherRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ success: '', error: '' });

    try {
      const other_keys = otherRows.map((r) => r.key);
      const other_values = otherRows.map((r) => r.value);

      const payload = {
        ...form,
        branding_primary: form?.branding?.primary ?? form?.branding_primary ?? '',
        branding_secondary: form?.branding?.secondary ?? form?.branding_secondary ?? '',
        branding_logo_url: form?.branding?.logo_url ?? form?.branding_logo_url ?? '',
        other_keys,
        other_values,
      };

      // Backend expects a flat payload (not nested under user_preference)
      await api.put('/api/v1/user_preference', payload);
      setFeedback({ success: 'Preferences saved.', error: '' });
      setTimeout(() => navigate('/preferences'), 400);
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0] || err?.response?.data?.error || 'Failed to save preferences';
      setFeedback({ success: '', error: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Edit Preferences</h1>
        <p className="mt-2 text-gray-600">Update how BizMind AI behaves for you.</p>

        {loading ? (
          <p className="mt-6 text-gray-600">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-xl border p-6 space-y-4">
            {feedback.error && <p className="text-sm text-red-600">{feedback.error}</p>}
            {feedback.success && <p className="text-sm text-green-700">{feedback.success}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                name="theme"
                value={form.theme || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {THEME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                name="language"
                value={form.language || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {LANGUAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                name="industry"
                value={form.industry || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
              <select
                name="niche"
                value={form.niche || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {NICHE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template style</label>
              <select
                name="template_style"
                value={form.template_style || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {TEMPLATE_STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tone of voice</label>
              <select
                name="tone_of_voice"
                value={form.tone_of_voice || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default output format</label>
              <select
                name="default_output_format"
                value={form.default_output_format || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {OUTPUT_FORMAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Branding</h3>
              <p className="mt-1 text-sm text-gray-600">Set your brand colors and logo (optional).</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary color</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    name="branding_primary"
                    value={form?.branding_primary ?? form?.branding?.primary ?? ''}
                    onChange={handleChange}
                    placeholder="#2563EB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary color</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    name="branding_secondary"
                    value={form?.branding_secondary ?? form?.branding?.secondary ?? ''}
                    onChange={handleChange}
                    placeholder="#4F46E5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    name="branding_logo_url"
                    value={form?.branding_logo_url ?? form?.branding?.logo_url ?? ''}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Other</h3>
              <p className="mt-1 text-sm text-gray-600">Add extra preferences as key/value pairs.</p>

              <div className="mt-4 space-y-3">
                {otherRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-start">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2"
                        value={row.key}
                        onChange={handleOtherRowChange(idx, 'key')}
                        placeholder="e.g. timezone"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2"
                        value={row.value}
                        onChange={handleOtherRowChange(idx, 'value')}
                        placeholder="e.g. Asia/Karachi"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                      <button
                        type="button"
                        onClick={() => removeOtherRow(idx)}
                        disabled={otherRows.length === 1}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOtherRow}
                  className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  + Add another
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                saving ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
              }`}
            >
              {saving ? 'Saving…' : 'Save preferences'}
            </button>
          </form>
        )}
    </div>
  );
};

export default PreferencesEdit;
