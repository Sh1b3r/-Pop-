import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, login, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'register') {
      if (!name.trim()) {
        setError("Введіть ваше ім'я");
        return;
      }
      if (password !== passwordConfirm) {
        setError('Паролі не співпадають');
        return;
      }
      register(name, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white animate-fadeIn">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Заголовок табов */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`pb-3 px-4 font-bold text-sm tracking-wide border-b-2 transition-colors cursor-pointer ${
              authMode === 'login'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Вхід в аккаунт
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setError('');
            }}
            className={`pb-3 px-4 font-bold text-sm tracking-wide border-b-2 transition-colors cursor-pointer ${
              authMode === 'register'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Реєстрація
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Ваше ім'я</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Олександр"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Електронна пошта</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {authMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Повторіть пароль</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{authMode === 'register' ? 'Зареєструватися' : 'Увійти'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {authMode === 'login' ? (
            <span>
              Ще немає аккаунта?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-red-400 font-bold hover:underline cursor-pointer"
              >
                Зареєструватися
              </button>
            </span>
          ) : (
            <span>
              Вже маєте аккаунт?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="text-red-400 font-bold hover:underline cursor-pointer"
              >
                Увійти
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

