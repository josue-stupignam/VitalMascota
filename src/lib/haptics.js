export function vibrate(pattern = 15) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    // La vibración es opcional: nunca debe romper el flujo de guardado.
  }
}

export function vibrateSuccess() {
  vibrate([12, 40, 18]);
}
