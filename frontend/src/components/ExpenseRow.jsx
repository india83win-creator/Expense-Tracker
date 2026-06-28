import { Pencil, Trash2 } from 'lucide-react';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ExpenseRow({ expense, onEdit, onDelete }) {
  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-white/5 transition-colors">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0"
        style={{ background: `${expense.category_color || '#94A3B8'}1A` }}
      >
        {expense.category_icon || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{expense.description || expense.category_name}</p>
        <p className="text-xs text-ink-faint">
          {expense.category_name} · {formatDate(expense.date)}
        </p>
      </div>
      <span className="font-mono text-sm shrink-0">{formatINR(expense.amount)}</span>
      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(expense)}
          className="p-1.5 rounded-md hover:bg-white/10 text-ink-soft hover:text-ink"
          aria-label="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(expense)}
          className="p-1.5 rounded-md hover:bg-white/10 text-ink-soft hover:text-coral"
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
