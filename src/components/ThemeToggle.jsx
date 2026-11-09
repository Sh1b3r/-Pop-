import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <label className="switch" title={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}>
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        aria-label="Перемикач теми"
      />
      <div className="slider round">
        <div className="sun-moon">
          {/* Місячні плями */}
          <svg id="moon-dot-1" className="moon-dot" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" r="2.5"></circle>
          </svg>
          <svg id="moon-dot-2" className="moon-dot" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" r="2.5"></circle>
          </svg>
          <svg id="moon-dot-3" className="moon-dot" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" r="2.5"></circle>
          </svg>
          {/* Промені (Сонце) */}
          <svg id="light-ray-sun" className="light-ray" viewBox="0 0 26 26">
            <path
              d="M13,0 L14.5,4 L19,2.5 L17.5,7 L22,8.5 L18,10.5 L20,15 L14.5,14 L13,18.5 L11.5,14 L7,15 L9,10.5 L5,8.5 L9.5,7 L8,2.5 L12.5,4 Z"
              fill="#ffe066"
            />
          </svg>
          {/* Хмари */}
          <svg id="cloud-1" className="cloud-light" viewBox="0 0 15 15">
            <circle cx="4" cy="10" r="4"></circle>
            <circle cx="10" cy="10" r="4"></circle>
            <circle cx="7" cy="6" r="5"></circle>
          </svg>
          <svg id="cloud-2" className="cloud-light" viewBox="0 0 15 15">
            <circle cx="4" cy="10" r="4"></circle>
            <circle cx="10" cy="10" r="4"></circle>
            <circle cx="7" cy="6" r="5"></circle>
          </svg>
        </div>
        {/* Зірки */}
        <div className="stars">
          <svg id="star-1" className="star" viewBox="0 0 10 10">
            <polygon points="5,0 6.5,3.5 10,4 7,6.5 7.5,10 5,8 2.5,10 3,6.5 0,4 3.5,3.5" />
          </svg>
          <svg id="star-2" className="star" viewBox="0 0 10 10">
            <polygon points="5,0 6.5,3.5 10,4 7,6.5 7.5,10 5,8 2.5,10 3,6.5 0,4 3.5,3.5" />
          </svg>
          <svg id="star-3" className="star" viewBox="0 0 10 10">
            <polygon points="5,0 6.5,3.5 10,4 7,6.5 7.5,10 5,8 2.5,10 3,6.5 0,4 3.5,3.5" />
          </svg>
          <svg id="star-4" className="star" viewBox="0 0 10 10">
            <polygon points="5,0 6.5,3.5 10,4 7,6.5 7.5,10 5,8 2.5,10 3,6.5 0,4 3.5,3.5" />
          </svg>
        </div>
      </div>
    </label>
  );
};

