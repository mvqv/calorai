import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { toast } from 'sonner';

const SLIDES = [
  {
    img: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_05fb0494-2afe-4c3f-bce6-c1237d257f8a.jpg',
    title: 'Track Your Calories',
    sub: 'Log every meal in seconds and stay on top of your daily nutrition goals.',
  },
  {
    img: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_37e2b810-1ae2-46a1-a25d-6ca58095e3e3.jpg',
    title: 'Stay Motivated',
    sub: 'See real progress with beautiful analytics and weekly streaks.',
  },
  {
    img: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0bb8b8a9-9293-4c65-a1b8-36a89572c952.jpg',
    title: 'Eat Smart, Live Better',
    sub: 'AI-powered food recognition helps you log meals with just a photo.',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [slide, setSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    navigate('/', { replace: true });
  };

  if (showAuth) {
    return (
      <div className="app-bg min-h-screen flex flex-col items-center justify-center px-5">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Flame size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">CalorAI</span>
        </div>

        <div className="glass-strong rounded-3xl p-7 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-foreground mb-1 text-balance">{t('sign_in')}</h2>
          <p className="text-sm text-muted-foreground mb-6 text-pretty">{t('have_account')}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="email" placeholder={t('email')} value={email}
                onChange={e => setEmail(e.target.value)}
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

            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl" disabled={loading}>
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('sign_in_btn')}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {t('no_account')}{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">{t('sign_up')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const s = SLIDES[slide];
  return (
    <div className="min-h-screen relative overflow-hidden">
      <img src={s.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-14 pb-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Flame size={19} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">CalorAI</span>
        </div>

        <div className="flex gap-2 mt-auto mb-6">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${i === slide ? 'bg-primary w-8' : 'bg-white/40 w-4'}`}
            />
          ))}
        </div>

        <h1 className="text-3xl font-bold text-white leading-tight text-balance">{s.title}</h1>
        <p className="text-white/80 mt-3 text-base text-pretty">{s.sub}</p>

        <div className="flex gap-3 mt-8">
          {slide < SLIDES.length - 1 ? (
            <>
              <Button variant="ghost" onClick={() => setShowAuth(true)}
                className="flex-1 h-13 border border-white/60 text-white hover:bg-white/10 rounded-2xl">
                Skip
              </Button>
              <Button onClick={() => setSlide(slide + 1)}
                className="flex-1 h-13 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl">
                {t('next')}
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowAuth(true)}
              className="w-full h-13 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-2xl">
              {t('finish')} 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
