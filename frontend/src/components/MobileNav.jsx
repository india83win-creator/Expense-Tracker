import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tags } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/categories', label: 'Categories', icon: Tags },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40">
      <div className="glass-strong rounded-xl2 shadow-glass flex justify-around p-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-[11px] font-medium transition-all ${
                isActive ? 'text-emerald-glow bg-white/10' : 'text-ink-soft'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
