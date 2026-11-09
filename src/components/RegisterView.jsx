import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const RegisterView = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== passwordRepeat) {
      alert('Паролі не співпадають!');
      return;
    }
    register(name, email, password);
    onNavigate('home');
  };

  return (
    <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="login">
        <div className="hader">
          <span>Створіть свій аккаунт</span>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Введіть ім'я"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <input
            type="password"
            placeholder="Повторіть пароль"
            required
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
          />
          <button type="submit" id="registerBtn">
            Зареєструватися
          </button>
          <span>
            Вже маєте аккаунт?{' '}
            <a
              href="login.html"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Увійти
            </a>
          </span>
        </form>
      </div>
    </div>
  );
};

