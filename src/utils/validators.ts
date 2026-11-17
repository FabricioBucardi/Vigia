export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TELEFONE_REGEX = /^[1-9]{2}(9\d{8}|[2-5]\d{7})$/;

export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

export function aplicarMascaraTelefone(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
