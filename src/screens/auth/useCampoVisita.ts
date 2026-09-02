import { useState } from 'react';

export type CampoVisita = 'nome' | 'email' | 'data' | 'confirmar';

function useCampoVisita() {
  const [tocados, setTocados] = useState<Partial<Record<CampoVisita, boolean>>>({});
  const [focados, setFocados] = useState<Partial<Record<CampoVisita, boolean>>>({});

  function onFocus(campo: CampoVisita) {
    setFocados((prev) => ({ ...prev, [campo]: true }));
  }

  function onBlur(campo: CampoVisita) {
    setFocados((prev) => ({ ...prev, [campo]: false }));
    setTocados((prev) => ({ ...prev, [campo]: true }));
  }

  return {
    focado: (campo: CampoVisita) => !!focados[campo],
    tocado: (campo: CampoVisita) => !!tocados[campo],
    onFocus,
    onBlur,
  };
}

export default useCampoVisita;