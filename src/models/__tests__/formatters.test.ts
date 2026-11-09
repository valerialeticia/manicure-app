import {
  formatDateLabel,
  formatDayParts,
  formatDuration,
  formatMonthYear,
  formatPhone,
  formatPrice,
} from '../formatters';

describe('Textos exibidos para a cliente', () => {
  it('mostra o preço em reais', () => {
    expect(formatPrice(35)).toMatch(/^R\$\s35,00$/);
  });

  it('mostra a duração do serviço de um jeito fácil de ler', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h30');
  });

  it('mostra o dia com o nome da semana', () => {
    expect(formatDateLabel('2026-11-10')).toBe('Terça-feira, 10/11');
  });

  it('mostra o dia de forma curta na fileira de datas', () => {
    expect(formatDayParts('2026-11-10')).toEqual({ weekday: 'ter', day: '10', month: 'nov' });
  });

  it('mostra o mês e o ano da data escolhida', () => {
    expect(formatMonthYear('2026-11-10')).toBe('Novembro de 2026');
  });

  it('organiza o telefone celular enquanto a cliente digita', () => {
    expect(formatPhone('11')).toBe('(11');
    expect(formatPhone('119123')).toBe('(11) 9123');
    expect(formatPhone('11912345678')).toBe('(11) 91234-5678');
  });

  it('organiza o telefone fixo e ignora letras ou números a mais', () => {
    expect(formatPhone('1132345678')).toBe('(11) 3234-5678');
    expect(formatPhone('11a91234567899')).toBe('(11) 91234-5678');
  });
});
