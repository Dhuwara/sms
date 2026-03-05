import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const FORMAT_OPTIONS = [
  { value: '{{YYYY}}', label: '{{YYYY}} — Full year (e.g. 2026)' },
  { value: '{{YY}}', label: '{{YY}} — Short year (e.g. 26)' },
  { value: '{{YY/MM}}', label: '{{YY/MM}} — Year/Month (e.g. 26/03)' },
  { value: '{{YYMM}}', label: '{{YYMM}} — YearMonth (e.g. 2603)' },
  { value: '', label: 'None — No date part' },
];

const buildPreview = ({ prefix, format, start, padding }) => {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const yy = yyyy.slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  let datePart = '';
  if (format === '{{YYYY}}') datePart = yyyy;
  else if (format === '{{YY}}') datePart = yy;
  else if (format === '{{YY/MM}}') datePart = `${yy}/${mm}`;
  else if (format === '{{YYMM}}') datePart = `${yy}${mm}`;
  const paddedSeq = String(Number(start) || 1).padStart(Number(padding) || 3, '0');
  return `${prefix}${datePart}${paddedSeq}`;
};

const EMPTY_EMP = { prefix: '', format: '{{YYYY}}', start: 1, padding: 3 };
const EMPTY_STD = { prefix: '', standardFormat: 'number', sectionFormat: 'ABC' };

const TABS = ['Employee ID', 'Standard'];

// ─── Employee ID Tab ──────────────────────────────────────────────────────────

const EmployeeIdTab = () => {
  const [formData, setFormData] = useState(EMPTY_EMP);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/counter/employeeId');
        const { prefix, format, start, padding } = res.data;
        setFormData({ prefix: prefix || '', format: format || '{{YYYY}}', start: start ?? 1, padding: padding ?? 3 });
      } catch {
        // No config yet — keep defaults
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/counter/configure', { name: 'employeeId', ...formData });
      toast.success('Employee ID settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const preview = buildPreview(formData);

  return (
    <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#FEF3C7] rounded-lg">
          <SettingsIcon size={22} className="text-[#F59E0B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Employee ID Configuration</h2>
          <p className="text-sm text-[#64748B]">Auto-generated when a new teacher is added</p>
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center gap-2 text-[#64748B] py-4">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm">Loading configuration...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="s-prefix" className="block text-sm font-medium text-[#0F172A] mb-2">Prefix</label>
              <input
                id="s-prefix"
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                placeholder="e.g. EMP"
                className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              />
            </div>

            <div>
              <label htmlFor="s-format" className="block text-sm font-medium text-[#0F172A] mb-2">Date Format</label>
              <select
                id="s-format"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="s-start" className="block text-sm font-medium text-[#0F172A] mb-2">Starting Number</label>
              <input
                id="s-start"
                type="number"
                min="1"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              />
            </div>

            <div>
              <label htmlFor="s-padding" className="block text-sm font-medium text-[#0F172A] mb-2">Number Padding (digits)</label>
              <input
                id="s-padding"
                type="number"
                min="1"
                max="10"
                value={formData.padding}
                onChange={(e) => setFormData({ ...formData, padding: e.target.value })}
                className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              />
            </div>
          </div>

          <div className="p-4 bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg">
            <p className="text-xs font-semibold text-[#64748B] uppercase mb-1">Preview — First ID generated</p>
            <p className="text-2xl font-bold text-[#0F172A] tracking-widest">{preview}</p>
          </div>

          <div className="pt-2 border-t-2 border-[#FCD34D]">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ─── Standard Tab ─────────────────────────────────────────────────────────────

const StandardTab = () => {
  const [data, setData] = useState(EMPTY_STD);
  const [draft, setDraft] = useState(EMPTY_STD);
  const [isEditing, setIsEditing] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/class-config');
        const { prefix, standardFormat, sectionFormat } = res.data;
        const cfg = { prefix: prefix || '', standardFormat: standardFormat || 'number', sectionFormat: sectionFormat || 'ABC' };
        setData(cfg);
        setDraft(cfg);
      } catch {
        // No config yet — keep defaults
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const handleEdit = () => {
    setDraft({ ...data });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...data });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/class-config/upsert', draft);
      const { prefix, standardFormat, sectionFormat } = res.data;
      const saved = { prefix: prefix || '', standardFormat: standardFormat || 'number', sectionFormat: sectionFormat || 'ABC' };
      setData(saved);
      setDraft(saved);
      setIsEditing(false);
      toast.success('Standard configuration saved!');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (editing) =>
    `w-full h-10 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] ${
      editing ? 'border-[#FCD34D] bg-white' : 'border-gray-200 bg-gray-50 text-[#64748B]'
    }`;

  const STANDARD_FORMAT_OPTS = [
    { value: 'number', label: 'Number (e.g. Grade 1, Grade 2)' },
    { value: 'roman', label: 'Roman (e.g. Grade I, Grade II)' },
  ];

  const SECTION_FORMAT_OPTS = [
    { value: 'ABC', label: 'Alphabetical (e.g. A, B, C)' },
    { value: 'roman', label: 'Roman (e.g. I, II, III)' },
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FEF3C7] rounded-lg">
            <SettingsIcon size={22} className="text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Standard Configuration</h2>
            <p className="text-sm text-[#64748B]">Class naming format used across the system</p>
          </div>
        </div>
        {!isEditing && !fetching && (
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-2 border-2 border-[#FCD34D] text-[#0F172A] hover:bg-[#FEF3C7] px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
      </div>

      {fetching ? (
        <div className="flex items-center gap-2 text-[#64748B] py-4">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm">Loading configuration...</span>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="std-prefix" className="block text-sm font-medium text-[#0F172A] mb-2">Prefix</label>
              <input
                id="std-prefix"
                type="text"
                value={isEditing ? draft.prefix : data.prefix}
                onChange={(e) => setDraft({ ...draft, prefix: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g. Grade"
                className={inputClass(isEditing)}
              />
            </div>

            <div>
              <label htmlFor="std-std-format" className="block text-sm font-medium text-[#0F172A] mb-2">Standard Format</label>
              <select
                id="std-std-format"
                value={isEditing ? draft.standardFormat : data.standardFormat}
                onChange={(e) => setDraft({ ...draft, standardFormat: e.target.value })}
                disabled={!isEditing}
                className={inputClass(isEditing)}
              >
                {STANDARD_FORMAT_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="std-sec-format" className="block text-sm font-medium text-[#0F172A] mb-2">Section Format</label>
              <select
                id="std-sec-format"
                value={isEditing ? draft.sectionFormat : data.sectionFormat}
                onChange={(e) => setDraft({ ...draft, sectionFormat: e.target.value })}
                disabled={!isEditing}
                className={inputClass(isEditing)}
              >
                {SECTION_FORMAT_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="pt-2 border-t-2 border-[#FCD34D] flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 border-2 border-gray-300 text-[#64748B] hover:bg-gray-50 px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Employee ID');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B] mt-1">Configure system preferences</p>
      </div>

      <div className="flex gap-1 border-b-2 border-[#FCD34D]">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-[#FCD34D] text-[#0F172A]'
                : 'text-[#64748B] hover:bg-[#FEF3C7] hover:text-[#0F172A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Employee ID' && <EmployeeIdTab />}
      {activeTab === 'Standard' && <StandardTab />}
    </div>
  );
};

export default Settings;
