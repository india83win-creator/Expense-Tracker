import { useEffect, useState } from 'react';
import Modal from './Modal';

const todayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ExpenseFormModal({ open, onClose, onSubmit, categories, initial }) {
  const [form, setForm] = useState({
    amount: '',
    description: '',
    categoryId: '',
    date: todayStr(),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              amount: initial.amount,
              description: initial.description || '',
              categoryId: initial.category_id,
              date: initial.date,
            }
          : { amount: '', description: '', categoryId: categories[0]?.id || '', date: todayStr() }
      );
      setError('');
    }
  }, [open, initial, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!form.categoryId) {
      setError('Choose a category.');
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
    <Modal open={open} onClose={onClose} title={initial ? 'Edit expense' : 'Add expense'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-mono">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              autoFocus
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="glass-input w-full rounded-lg pl-8 pr-4 py-3 font-mono text-lg"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What was this for?"
            className="glass-input w-full rounded-lg px-4 py-3 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-soft mb-1.5 block">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="glass-input w-full rounded-lg px-3 py-3 text-sm appearance-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-panel">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-soft mb-1.5 block">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="glass-input w-full rounded-lg px-3 py-3 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-coral text-xs">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 bg-emerald-glow text-void font-semibold rounded-lg py-3 text-sm hover:brightness-110 transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add expense'}
        </button>
      </form>
    </Modal>
  );
}
