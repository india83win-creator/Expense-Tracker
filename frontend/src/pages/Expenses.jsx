import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { ExpensesAPI, CategoriesAPI } from '../api/client';
import GlassCard from '../components/GlassCard';
import ExpenseRow from '../components/ExpenseRow';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.categoryId = categoryFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const data = await ExpensesAPI.list(params);
    setExpenses(data);
    setLoading(false);
  }, [search, categoryFilter, startDate, endDate]);

  useEffect(() => {
    CategoriesAPI.list().then(setCategories);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search/filter changes
    return () => clearTimeout(t);
  }, [load]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (form) => {
    const payload = {
      amount: form.amount,
      description: form.description,
      categoryId: form.categoryId,
      date: form.date,
    };
    if (editing) {
      await ExpensesAPI.update(editing.id, payload);
    } else {
      await ExpensesAPI.create(payload);
    }
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    await ExpensesAPI.remove(deleting.id);
    setDeleting(null);
    await load();
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = search || categoryFilter || startDate || endDate;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Expenses</h1>
          <p className="text-ink-soft text-sm mt-1">
            {expenses.length} result{expenses.length !== 1 ? 's' : ''} · {formatINR(total)} total
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="bg-emerald-glow text-void font-semibold rounded-lg px-5 py-3 text-sm flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add expense
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-xs text-ink-soft mb-1.5 block">Search</label>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Search descriptions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full rounded-lg pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input rounded-lg px-3 py-2.5 text-sm appearance-none w-full sm:w-auto"
          >
            <option value="" className="bg-panel">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-panel">
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">From date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="glass-input rounded-lg px-3 py-2.5 text-sm w-full"
          />
        </div>
        <div>
          <label className="text-xs text-ink-soft mb-1.5 block">To date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="glass-input rounded-lg px-3 py-2.5 text-sm w-full"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink px-2 py-2.5 shrink-0"
          >
            <X size={13} /> Clear
          </button>
        )}
      </GlassCard>

      {/* List */}
      <GlassCard className="p-3">
        {loading ? (
          <p className="text-ink-faint text-sm px-4 py-8 text-center">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="text-ink-faint text-sm px-4 py-10 text-center">
            No expenses match these filters.
          </p>
        ) : (
          <div className="flex flex-col">
            {expenses.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                onEdit={(exp) => {
                  setEditing(exp);
                  setFormOpen(true);
                }}
                onDelete={(exp) => setDeleting(exp)}
              />
            ))}
          </div>
        )}
      </GlassCard>

      <ExpenseFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        categories={categories}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete expense?"
        message={`This will permanently remove "${deleting?.description || deleting?.category_name}" (${formatINR(deleting?.amount)}).`}
      />
    </div>
  );
}
