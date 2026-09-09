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

  const tentativa = new Date(ano, mes - 1, dia);
  if (
    tentativa.getFullYear() !== ano ||
    tentativa.getMonth() !== mes - 1 ||
    tentativa.getDate() !== dia
  ) {
    return false;
  }

  const hoje = new Date();
  if (tentativa > hoje) return false;

  let idade = hoje.getFullYear() - ano;
  const difMes = hoje.getMonth() - (mes - 1);
  if (difMes < 0 || (difMes === 0 && hoje.getDate() < dia)) {
    idade--;
  }

  return idade >= 12 && idade <= 120;
}
