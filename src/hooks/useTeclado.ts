import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export type EstadoTeclado = {
  tecladoAberto: boolean;
  alturaTeclado: number;
};

/**
 * useTeclado
 *
 * Observa o teclado virtual do sistema e informa se ele está aberto e qual a
 * sua altura atual.
 *
 * Por que existe:
 * - No Android com edge-to-edge (padrão a partir do Expo SDK 53 e obrigatório
 *   no Android 15/16), a janela NÃO é mais redimensionada pelo `adjustResize`
 *   quando o teclado abre. Por isso, telas que dependem desse comportamento
 *   precisam saber que o teclado está aberto para se ajustar (ex.: usar
 *   `KeyboardAvoidingView` ou rolar até o campo focado).
 * - Centraliza os listeners de teclado em um único lugar, evitando duplicar
 *   `Keyboard.addListener` (e o tratamento de evento por plataforma) em cada
 *   tela.
 *
 * Comportamento:
 * - Usa `keyboardWillShow`/`keyboardWillHide` no iOS (para reagir antes da
 *   animação terminar) e `keyboardDidShow`/`keyboardDidHide` no Android.
 * - `alturaTeclado` é a altura reportada pelo evento (`endCoordinates.height`).
 *   Prefira o `KeyboardAvoidingView` para cálculo de layout; use a altura
 *   apenas quando precisar de valores absolutos (ex.: animações customizadas).
 * - Os listeners são removidos automaticamente ao desmontar o componente.
 */
export function useTeclado(): EstadoTeclado {
  const [estado, setEstado] = useState<EstadoTeclado>({
    tecladoAberto: false,
    alturaTeclado: 0,
  });

  useEffect(() => {
    const eventoMostrar = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const eventoEsconder = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const aoMostrar = Keyboard.addListener(eventoMostrar, (e) => {
      setEstado({ tecladoAberto: true, alturaTeclado: e.endCoordinates.height });
    });
    const aoEsconder = Keyboard.addListener(eventoEsconder, () => {
      setEstado({ tecladoAberto: false, alturaTeclado: 0 });
    });

    return () => {
      aoMostrar.remove();
      aoEsconder.remove();
    };
  }, []);

  return estado;
}
