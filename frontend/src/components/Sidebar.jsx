import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tags, Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/categories', label: 'Categories', icon: Tags },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 p-5">
      <div className="glass rounded-xl2 h-full flex flex-col p-5">
        <div className="flex items-center gap-2.5 px-1 mb-10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-glow to-gold flex items-center justify-center shadow-glow">
            <Wallet size={18} className="text-void" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg tracking-tight">Midnight Ledger</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-ink border border-white/10'
                    : 'text-ink-soft hover:text-ink hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="glass rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-ink-faint truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:text-coral hover:bg-white/5 transition-all"
          >
            <LogOut size={16} strokeWidth={2} />
            Sign out
          </button>
          <div className="mt-2 text-[10px] text-ink-faint text-center tracking-wider uppercase border-t border-white/5 pt-4">
            A product made by<br/>
            <span className="font-semibold text-emerald-glow tracking-widest mt-1 inline-block">Dhananjay Baral</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
