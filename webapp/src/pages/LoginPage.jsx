import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const [mode, setMode] = useState('customer');
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginAdmin, sendOtp, verifyOtp, user, isFirebaseConfigured } = useAuth();
  const { t, tr } = useLanguage();
  const navigate = useNavigate();

  if (user) { navigate('/'); return null; }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const resetOtp = () => { setOtp(''); setOtpSent(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // Small UX delay

    if (mode === 'admin') {
      const result = await loginAdmin(form.email, form.password);
      setLoading(false);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error);
      }
      return;
    }

    if (!isFirebaseConfigured) {
      setLoading(false);
      setError(t('login.firebaseMissing'));
      return;
    }

    if (!otpSent) {
      const result = await sendOtp(form.phone, 'recaptcha-container');
      setLoading(false);
      if (result.success) {
        setOtpSent(true);
      } else {
        setError(result.error);
      }
      return;
    }

    const result = await verifyOtp(otp, { name: isLogin ? '' : form.name, email: form.email, phone: form.phone });
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest-700 relative overflow-hidden items-center justify-center p-12 grain-overlay">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center">
          <Leaf className="text-terra-300 mx-auto mb-6" size={40} />
          <h2 className="font-serif text-4xl text-cream font-light mb-4">BR Fresh Extracts</h2>
          <p className="text-cream/60 text-sm leading-relaxed max-w-xs">
            {t('login.panelSubtitle')}
          </p>
          <div className="mt-10 space-y-3 text-left">
            {[t('login.panelBullet1'), t('login.panelBullet2'), t('login.panelBullet3')].map(line => (
              <div key={line} className="flex items-center gap-2 text-cream/70 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-terra-400 shrink-0" /> {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-1.5 text-terra-500 text-sm mb-6 lg:hidden">
              <Leaf size={15} /> BR Fresh Extracts
            </Link>
            <h1 className="font-serif text-3xl text-forest-700 mb-2">
              {mode === 'admin'
                ? t('login.adminTitle')
                : (isLogin ? t('login.welcome') : t('login.create'))}
            </h1>
            <p className="text-warm-brown/60 text-sm">
              {mode === 'admin'
                ? t('login.adminSub')
                : (isLogin ? t('login.signInSub') : t('login.signUpSub'))}
            </p>
          </div>
          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setMode('customer'); resetOtp(); setError(''); }}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                mode === 'customer'
                  ? 'bg-terra-500 text-white border-terra-500'
                  : 'bg-white text-warm-brown border-sand-200'
              }`}
            >
              {t('login.customerTab')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('admin'); resetOtp(); setError(''); }}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                mode === 'admin'
                  ? 'bg-forest-600 text-white border-forest-600'
                  : 'bg-white text-warm-brown border-sand-200'
              }`}
            >
              {t('login.adminTab')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'customer' && !isLogin && (
              <div>
                <label className="label">{t('login.fullName')}</label>
                <input className="input-field" type="text" placeholder="Your name" required
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}

            {mode === 'customer' && (
              <div>
                <label className="label">{t('login.phone')}</label>
                <input className="input-field" type="tel" placeholder={t('login.phonePlaceholder')} required
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            )}

            {mode === 'customer' && !isLogin && (
              <div>
                <label className="label">{t('login.emailOptional')}</label>
                <input className="input-field" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            )}

            {mode === 'customer' && otpSent && (
              <div>
                <label className="label">{t('login.otpLabel')}</label>
                <input className="input-field" type="text" inputMode="numeric" placeholder="123456" required
                  value={otp} onChange={e => setOtp(e.target.value)} />
                <button type="button" onClick={async () => {
                  setError('');
                  setLoading(true);
                  const result = await sendOtp(form.phone, 'recaptcha-container');
                  setLoading(false);
                  if (!result.success) setError(result.error);
                }}
                  className="text-xs text-terra-500 hover:underline mt-2">
                  {t('login.resendOtp')}
                </button>
              </div>
            )}

            {mode === 'admin' && (
              <>
                <div>
                  <label className="label">{t('login.adminEmail')}</label>
                  <input className="input-field" type="email" placeholder="admin@example.com" required
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t('login.adminPassword')}</label>
                  <div className="relative">
                    <input className="input-field pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                      value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-brown/40 hover:text-warm-brown">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{tr(error)}</p>}

            <button type="submit" disabled={loading}
              className="btn-primary w-full text-center flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                mode === 'admin'
                  ? t('login.adminSignIn')
                  : (otpSent ? t('login.verifyOtp') : t('login.sendOtp'))
              )}
            </button>

            {mode === 'customer' && !isFirebaseConfigured && (
              <p className="text-xs text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
                {t('login.firebaseMissing')}
              </p>
            )}

            <div id="recaptcha-container" className="hidden" />
          </form>

          {mode === 'customer' && (
            <p className="mt-6 text-center text-sm text-warm-brown/60">
              {isLogin ? t('login.noAccount') : t('login.haveAccount')}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); resetOtp(); }}
                className="text-terra-500 hover:underline font-medium">
                {isLogin ? t('login.signUpLink') : t('login.signInLink')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
