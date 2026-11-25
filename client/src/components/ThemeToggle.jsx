import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button type="button" className="st-icon-btn" onClick={toggleTheme} aria-label={label} title={label}>
      <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon-stars'}`} />
    </button>
  );
}
