import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CategoriesAPI } from '../api/client';
import GlassCard from '../components/GlassCard';
import CategoryFormModal from '../components/CategoryFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    const data = await CategoriesAPI.list();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (form) => {
    if (editing) {
      await CategoriesAPI.update(editing.id, form);
    } else {
      await CategoriesAPI.create(form);
    }
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      await CategoriesAPI.remove(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setDeleteError(err?.response?.data?.error || 'Could not delete this category.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Categories</h1>
          <p className="text-ink-soft text-sm mt-1">
            Organize spending into groups that make sense for you.
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
          New category
        </button>
      </div>

      {loading ? (
        <p className="text-ink-faint text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <GlassCard key={c.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                  style={{ background: `${c.color}1A` }}
                >
                  {c.icon}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setFormOpen(true);
                    }}
                    className="p-1.5 rounded-md hover:bg-white/10 text-ink-soft hover:text-ink"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleting(c);
                      setDeleteError('');
                    }}
                    className="p-1.5 rounded-md hover:bg-white/10 text-ink-soft hover:text-coral"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm">{c.name}</h3>
                <p className="text-xs text-ink-faint mt-1">
                  {c.expense_count} expense{c.expense_count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="font-mono text-lg" style={{ color: c.color }}>
                {formatINR(c.total_spent)}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        message={deleteError || `This will permanently remove "${deleting?.name}".`}
      />
    </div>
  );
}
