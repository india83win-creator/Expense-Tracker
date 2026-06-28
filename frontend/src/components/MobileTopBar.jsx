import { LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MobileTopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="md:hidden glass rounded-xl2 m-4 mb-2 p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-glow to-gold flex items-center justify-center">
          <Wallet size={15} className="text-void" strokeWidth={2.5} />
        </div>
        <span className="font-display text-sm">Hi, {user?.name?.split(' ')[0]}</span>
      </div>
      <button
        onClick={handleLogout}
        className="p-2 rounded-lg text-ink-soft hover:text-coral hover:bg-white/10 transition-colors"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
