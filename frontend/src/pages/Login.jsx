import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import AmbientBackground from '../components/AmbientBackground';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not sign in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard strong className="w-full max-w-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-glow to-gold flex items-center justify-center shadow-glow mb-4">
              <Wallet size={22} className="text-void" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-2xl">Welcome back</h1>
            <p className="text-ink-soft text-sm mt-1">Sign in to your ledger</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-ink-soft mb-1.5 block">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="glass-input w-full rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-ink-soft mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="glass-input w-full rounded-lg px-4 py-3 text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-coral text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-emerald-glow text-void font-semibold rounded-lg py-3 text-sm hover:brightness-110 transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            New here?{' '}
            <Link to="/signup" className="text-emerald-glow font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </GlassCard>
      </div>
    </>
  );
}
