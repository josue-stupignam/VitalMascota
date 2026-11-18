import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import '../../styles/global.css';

export default function SaveConfirmation({ show, message = 'Cambios guardados' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <p className="save-confirmation" role="status">
      <CheckCircle2 size={16} aria-hidden="true" />
      {message}
    </p>
  );
}
