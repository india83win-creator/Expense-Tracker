import { useEffect, useState, useCallback } from 'react';
import { Plus, TrendingUp, CalendarDays, Receipt, Pencil } from 'lucide-react';
import { SummaryAPI, ExpensesAPI, CategoriesAPI, AuthAPI } from '../api/client';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import ExpenseRow from '../components/ExpenseRow';
import ExpenseFormModal from '../components/ExpenseFormModal';
import BudgetFormModal from '../components/BudgetFormModal';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [s, c] = await Promise.all([SummaryAPI.get(), CategoriesAPI.list()]);
    setSummary(s);
    setCategories(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddExpense = async (form) => {
    await ExpensesAPI.create({
      amount: form.amount,
      description: form.description,
      categoryId: form.categoryId,
      date: form.date,
    });
    await load();
  };

  const handleUpdateBudget = async (amount) => {
    await AuthAPI.updateBudget(amount);
    await load();
  };

  if (loading) {
    return <div className="text-ink-soft text-sm p-8">Loading your ledger…</div>;
  }

  const budgetMonthlyTarget = summary.monthlyBudget || 30000;
  const pct = Math.min(100, Math.round((summary.totalThisMonth / budgetMonthlyTarget) * 100));
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <GlassCard strong className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-soft mb-2">
                Total spent this month
              </p>
              <p className="font-display text-5xl sm:text-6xl font-medium tracking-tight">
                {formatINR(summary.totalThisMonth)}
              </p>
              <p className="text-sm text-ink-faint mt-2">
                {summary.expenseCount} expense{summary.expenseCount !== 1 ? 's' : ''} logged in total ·{' '}
                {formatINR(summary.totalAll)} all-time
              </p>
            </div>

            <div className="hidden sm:block relative w-[100px] h-[100px] shrink-0">
              <svg width="100" height="100" className="-rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                onClick={() => setBudgetFormOpen(true)}
                title="Edit Monthly Budget"
              >
                <span className="font-mono text-sm font-medium">{pct}%</span>
                <span className="text-[10px] text-ink-faint group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                  of ₹{budgetMonthlyTarget >= 1000 ? `${budgetMonthlyTarget / 1000}k` : budgetMonthlyTarget}
                  <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="bg-emerald-glow text-void font-semibold rounded-lg px-5 py-3 text-sm flex items-center gap-2 hover:brightness-110 transition-all shrink-0 self-start"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add expense
          </button>
        </div>
      </GlassCard>

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Today"
          value={formatINR(summary.totalToday)}
          icon={CalendarDays}
          accent="#34D399"
        />
        <StatCard
          label="Top category"
          value={summary.topCategory ? `${summary.topCategory.icon} ${summary.topCategory.name}` : '—'}
          sub={summary.topCategory ? formatINR(summary.topCategory.total) + ' this month' : 'No data yet'}
          icon={TrendingUp}
          accent="#FBBF24"
        />
        <StatCard
          label="Transactions"
          value={summary.expenseCount}
          icon={Receipt}
          accent="#A78BFA"
          sub="All time"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryPieChart data={summary.byCategory} />
        <MonthlyTrendChart data={summary.monthlyTrend} />
      </div>

      {/* Recent expenses */}
      <GlassCard className="p-3">
        <h3 className="font-display text-base px-3 pt-2 pb-1">Recent activity</h3>
        {summary.recent.length === 0 ? (
          <p className="text-ink-faint text-sm px-4 py-8 text-center">
            Nothing here yet — add your first expense to get started.
          </p>
        ) : (
          <div className="flex flex-col">
            {summary.recent.map((e) => (
              <ExpenseRow key={e.id} expense={e} onEdit={() => {}} onDelete={() => {}} />
            ))}
          </div>
        )}
      </GlassCard>

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddExpense}
        categories={categories}
      />

      <BudgetFormModal
        open={budgetFormOpen}
        onClose={() => setBudgetFormOpen(false)}
        onSubmit={handleUpdateBudget}
        initialBudget={summary.monthlyBudget}
      />
    </div>
  );
}
