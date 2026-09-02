export function aplicarMascaraData(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  const partes = [
    digitos.slice(0, 2),
    digitos.slice(2, 4),
    digitos.slice(4, 8),
  ].filter(Boolean);
  return partes.join('/');
}

export function dataCoerente(data: string): boolean {
  if (data.length !== 10) return false;
  const [dia, mes, ano] = data.split('/').map(Number);
  if (mes < 1 || mes > 12 || ano < 1900 || ano > 2100) return false;
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const diasNoMes = [
    31,
    bissexto ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return dia >= 1 && dia <= diasNoMes[mes - 1];
}
