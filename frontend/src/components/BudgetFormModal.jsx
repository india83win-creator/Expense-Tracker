import { useEffect, useState } from 'react';
import Modal from './Modal';

export default function BudgetFormModal({ open, onClose, onSubmit, initialBudget }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(initialBudget ? initialBudget.toString() : '30000');
      setError('');
    }
  }, [open, initialBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Enter a budget amount greater than zero.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit(val);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Set Monthly Budget">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">Monthly Budget</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-mono">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="30000"
              className="glass-input w-full rounded-lg pl-8 pr-4 py-3 font-mono text-lg"
            />
          </div>
          <p className="text-[10px] text-ink-faint mt-2">
            This value is used to calculate your spending progress for the month.
          </p>
        </div>

        {error && <p className="text-coral text-xs">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 bg-emerald-glow text-void font-semibold rounded-lg py-3 text-sm hover:brightness-110 transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save budget'}
        </button>
      </form>
    </Modal>
  );
}
