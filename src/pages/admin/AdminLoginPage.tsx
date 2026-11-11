import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  DEMO_STAFF_PROFILES,
  useAdminAuth,
} from '@/context/AdminAuthContext';
import { BrandLogo } from '@/components/BrandLogo';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { signInWithEmail, signInDemoRole } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center px-4 py-10">
      <div className="max-w-md w-full mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-kumkum hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Website
        </Link>

        <div className="rounded-3xl bg-white border border-sand-border p-6 sm:p-8 shadow-md space-y-6">
          <div className="space-y-2">
            <BrandLogo size="sm" />
            <h1 className="font-serif text-2xl font-bold text-ink pt-2">
              Staff &amp; Owner Portal
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Role-based access for Owners, Outlet Managers, Kitchen Staff, and Cashiers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Staff Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@krishnakuteera.in"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-kumkum-soft border border-kumkum/30 p-3 text-xs font-semibold text-kumkum">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-kumkum hover:bg-kumkum-dark text-white py-3 text-sm font-bold cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div className="pt-4 border-t border-sand-border space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-banana-dark">
                <ShieldCheck className="w-4 h-4" />
                Demo Mode: Instant Role Preview
              </div>
              <p className="text-xs text-ink-muted">
                Supabase env keys aren&apos;t set yet — pick any staff role below to test
                role permissions and outlet-scoping:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_STAFF_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      signInDemoRole(profile);
                      navigate(
                        profile.role === 'kitchen_staff'
                          ? '/admin/orders'
                          : '/admin'
                      );
                    }}
                    className="flex items-center justify-between rounded-xl border border-sand-border bg-cream hover:bg-turmeric-soft px-3.5 py-2.5 text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-ink">
                        {profile.full_name}
                      </p>
                      <p className="text-[11px] text-ink-muted capitalize">
                        Role: {profile.role.replace('_', ' ')}
                      </p>
                    </div>
                    <UserCheck className="w-4 h-4 text-kumkum shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

