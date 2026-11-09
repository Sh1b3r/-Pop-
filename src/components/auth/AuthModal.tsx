import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { z } from 'zod';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Введіть коректну електронну пошту'),
  password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
  rememberMe: z.boolean().optional()
});

const signUpSchema = z.object({
  name: z.string().min(2, "Ім'я повинно містити щонайменше 2 символи"),
  email: z.string().email('Введіть коректну електронну пошту'),
  password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Паролі не співпадають',
  path: ['confirmPassword']
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { login, signup, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  // Password strength meter
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9!@#$%^&*]/.test(password)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse({ email, password, rememberMe });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Помилка входу' });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await signup(name, email, password);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Помилка реєстрації' });
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    login(demoEmail, 'password123');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div
        className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl relative animate-scaleUp"
        style={{
          background: 'rgba(16, 22, 34, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 107, 0, 0.15)'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Закрити"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-black/40 border border-white/20 p-1.5 flex items-center justify-center">
            <img src="/pop-logo.png" alt="POP!" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'signin' && 'Вхід до POP! Shop'}
            {mode === 'signup' && 'Реєстрація акаунту'}
            {mode === 'forgot' && 'Відновлення пароля'}
          </h2>
          <p className="text-xs text-white/60 mt-1">
            {mode === 'signin' && 'Увійдіть для збереження колекції та швидкого замовлення'}
            {mode === 'signup' && 'Створіть власний профіль та відкрийте ексклюзивні знижки'}
            {mode === 'forgot' && 'Введіть email для отримання інструкцій зі скидання'}
          </p>
        </div>

        {/* Tab switch */}
        {mode !== 'forgot' && (
          <div className="flex bg-black/30 p-1 rounded-xl mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/40'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Вхід
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/40'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Реєстрація
            </button>
          </div>
        )}

        {/* Form error */}
        {errors.form && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Електронна пошта
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@popshop.com"
                  className="glass-input w-full pl-9"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">
                  {errors.email}
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-white/80">Пароль</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#FF6B00] hover:underline"
                >
                  Забули пароль?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-9"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.password && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-[#FF6B00] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-white/70 cursor-pointer">
                Запам'ятати мене
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-accent w-full py-3 text-sm mt-2 font-bold"
            >
              {isLoading ? 'Перевірка...' : 'Увійти'}
            </button>

            {/* Quick Demo Accounts */}
            <div className="pt-4 border-t border-white/10 mt-6">
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-2 text-center tracking-wider">
                Швидкий тестовий вхід (Демо акаунти):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@popshop.com')}
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF6B00]/20 hover:border-[#FF6B00]/50 border border-white/10 text-[11px] font-bold text-white transition-all text-center"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('manager@popshop.com')}
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF6B00]/20 hover:border-[#FF6B00]/50 border border-white/10 text-[11px] font-bold text-white transition-all text-center"
                >
                  🛡️ Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('dmytro@gmail.com')}
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF6B00]/20 hover:border-[#FF6B00]/50 border border-white/10 text-[11px] font-bold text-white transition-all text-center"
                >
                  👤 User
                </button>
              </div>
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Повне ім'я
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Олександр Петренко"
                  className="glass-input w-full pl-9"
                />
                <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.name}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Електронна пошта
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@gmail.com"
                  className="glass-input w-full pl-9"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.email}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-9"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {/* Password strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength <= 25
                          ? 'bg-red-500 w-1/4'
                          : strength <= 50
                          ? 'bg-yellow-500 w-2/4'
                          : strength <= 75
                          ? 'bg-blue-500 w-3/4'
                          : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-white/50 mt-1 block">
                    {strength <= 25 && 'Слабкий пароль'}
                    {strength > 25 && strength <= 50 && 'Середній пароль'}
                    {strength > 50 && strength <= 75 && 'Хороший пароль'}
                    {strength > 75 && 'Надійний пароль'}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.password}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Підтвердження пароля
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-9"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.confirmPassword && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-accent w-full py-3 text-sm mt-2 font-bold"
            >
              {isLoading ? 'Створення акаунту...' : 'Зареєструватися'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-green-500/20 border border-green-500/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Лист надіслано!</h4>
                <p className="text-xs text-white/70">
                  Ми надіслали інструкції з відновлення на адресу {email}. Перевірте поштову скриньку.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="btn-accent text-xs mt-3 py-2 px-5"
                >
                  Повернутися до входу
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!email) {
                    setErrors({ email: 'Введіть email' });
                    return;
                  }
                  setForgotSent(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1.5">
                    Введіть вашу пошту
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@gmail.com"
                      className="glass-input w-full pl-9"
                      required
                    />
                    <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {errors.email && (
                    <span className="text-[11px] text-red-400 mt-1 block">{errors.email}</span>
                  )}
                </div>

                <button type="submit" className="btn-accent w-full py-3 text-sm font-bold">
                  Надіслати інструкції
                </button>

                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-white/60 hover:text-white w-full text-center block"
                >
                  Згадали пароль? Увійти
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
