import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { toast } from 'sonner';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!agreed) { toast.error('Please agree to the Terms of Service'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) { toast.error(error); return; }
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="app-bg min-h-screen flex flex-col items-center justify-center px-5">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
          <Flame size={22} className="text-white" />
        </div>
        <span className="text-2xl font-bold gradient-text">CalorAI</span>
      </div>

      <div className="glass-strong rounded-3xl p-7 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-foreground mb-1 text-balance">{t('sign_up')}</h2>
        <p className="text-sm text-muted-foreground mb-6 text-pretty">{t('no_account')}</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('full_name')} value={name} onChange={e => setName(e.target.value)}
              className="pl-10 h-12 bg-white/60 border-white/60 focus:border-primary" />
          </div>
          <div className="relative">
            <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)}
              className="pl-10 h-12 bg-white/60 border-white/60 focus:border-primary" />
          </div>
          <div className="relative">
            <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type={showPw ? 'text' : 'password'} placeholder={t('password')} value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 bg-white/60 border-white/60 focus:border-primary" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <label className="flex items-start gap-3 cursor-pointer min-h-12">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0" />
            <span className="text-xs text-muted-foreground text-pretty">
              I agree to the{' '}
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
            </span>
          </label>

          <Button type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
            disabled={loading}>
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('sign_up_btn')}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {t('have_account')}{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">{t('sign_in')}</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
