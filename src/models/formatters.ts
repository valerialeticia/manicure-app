import { toDateTime } from './schedule';

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`;
}

/** Ex.: "Terça-feira, 10/11" */
export function formatDateLabel(dateKey: string): string {
  const label = dateFormatter.format(toDateTime(dateKey));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const weekdayShortFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const monthShortFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const withoutDot = (text: string) => text.replace('.', '');

/** Partes curtas do dia para a fileira de datas. Ex.: { weekday: 'ter', day: '10', month: 'nov' } */
export function formatDayParts(dateKey: string): { weekday: string; day: string; month: string } {
  const date = toDateTime(dateKey);
  return {
    weekday: withoutDot(weekdayShortFormatter.format(date)),
    day: String(date.getDate()),
    month: withoutDot(monthShortFormatter.format(date)),
  };
}

/** Ex.: "Novembro de 2026" */
export function formatMonthYear(dateKey: string): string {
  const label = monthYearFormatter.format(toDateTime(dateKey));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Aplica a máscara de telefone brasileiro: (11) 91234-5678 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);
  if (number.length <= 4) return `(${ddd}) ${number}`;

  const splitAt = digits.length === 11 ? 5 : 4;
  return `(${ddd}) ${number.slice(0, splitAt)}-${number.slice(splitAt)}`;
}
