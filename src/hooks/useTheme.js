import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'vitalmascota_theme';

const leerTema = () => {
  try {
    return localStorage.getItem(CLAVE) === 'light' ? 'light' : 'dark';
  } catch (error) {
    return 'dark';
  }
};

let temaActual = null;
const suscriptores = new Set();

const notificar = () => {
  suscriptores.forEach((fn) => fn(temaActual));
};

const aplicarTema = (tema) => {
  temaActual = tema;
  document.documentElement.dataset.theme = tema;
  try {
    localStorage.setItem(CLAVE, tema);
  } catch (error) {
    console.error('No se pudo guardar el tema:', error);
  }
  notificar();
};

const obtenerTema = () => {
  if (temaActual === null) temaActual = leerTema();
  return temaActual;
};

export default function useTheme() {
  const [theme, setTheme] = useState(obtenerTema);

  useEffect(() => {
    suscriptores.add(setTheme);
    document.documentElement.dataset.theme = obtenerTema();
    return () => suscriptores.delete(setTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    aplicarTema(obtenerTema() === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggleTheme };
}
