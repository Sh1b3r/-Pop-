import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginView = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
      onNavigate('home');
    }
  };

  return (
    <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="login">
        <div className="hader">
          <span>Увійдіть у свій аккаунт</span>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Введіть email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Введіть пароль"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" id="registerBtn">
            Увійти
          </button>
          <span>
            Не маєте аккаунта?{' '}
            <a
              href="register.html"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('register');
              }}
            >
              Зареєструватися
            </a>
          </span>
        </form>
      </div>
    </div>
  );
};

