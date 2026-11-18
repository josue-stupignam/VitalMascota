import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'vitalmascota_theme';

const leerTema = () => {
  try {
    return localStorage.getItem(CLAVE) === 'light' ? 'light' : 'dark';
  } catch (error) {
    return 'dark';
  }
};

export default function useTheme() {
  const [theme, setTheme] = useState(leerTema);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(CLAVE, theme);
    } catch (error) {
      console.error('No se pudo guardar el tema:', error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((actual) => (actual === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
