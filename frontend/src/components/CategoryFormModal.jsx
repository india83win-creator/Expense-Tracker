import { useEffect, useState } from 'react';
import Modal from './Modal';

const COLORS = ['#34D399', '#FBBF24', '#FB7185', '#60A5FA', '#A78BFA', '#F472B6', '#22D3EE', '#94A3B8'];
const ICONS = ['✨', '🍽️', '🚗', '🛍️', '🧾', '🎬', '🩺', '✈️', '📦', '🏠', '💊', '🎓', '🐾', '🎁'];

export default function CategoryFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({ name: '', color: COLORS[0], icon: ICONS[0] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { name: initial.name, color: initial.color, icon: initial.icon } : { name: '', color: COLORS[0], icon: ICONS[0] });
      setError('');
    }
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Give the category a name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit category' : 'New category'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">Name</label>
          <input
            type="text"
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Subscriptions"
            className="glass-input w-full rounded-lg px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button
                type="button"
                key={icon}
                onClick={() => setForm({ ...form, icon })}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
                  form.icon === icon ? 'bg-white/15 ring-1 ring-white/30' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => setForm({ ...form, color })}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  background: color,
                  outline: form.color === color ? '2px solid white' : 'none',
                  outlineOffset: '2px',
                  transform: form.color === color ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-coral text-xs">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 bg-emerald-glow text-void font-semibold rounded-lg py-3 text-sm hover:brightness-110 transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create category'}
        </button>
      </form>
    </Modal>
  );
}
