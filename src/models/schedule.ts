import type { Appointment } from './appointment';

export const BUSINESS_HOURS = { opening: 9, closing: 18 } as const;

export interface DaySlot {
  time: string;
  available: boolean;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Horários de hora em hora; o último atendimento começa uma hora antes de fechar. */
export function generateTimeSlots(
  opening: number = BUSINESS_HOURS.opening,
  closing: number = BUSINESS_HOURS.closing,
): string[] {
  const slots: string[] = [];
  for (let hour = opening; hour < closing; hour++) {
    slots.push(`${pad(hour)}:00`);
  }
  return slots;
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toDateTime(dateKey: string, time = '00:00'): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

/** Próximos `count` dias a partir de `fromKey` (inclusive), como chaves "AAAA-MM-DD". */
export function getUpcomingDays(fromKey: string, count: number): string[] {
  const start = toDateTime(fromKey);
  return Array.from({ length: count }, (_, offset) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    return toDateKey(day);
  });
}

/** Soma minutos a um horário "HH:MM". Ex.: addMinutes('10:00', 90) → '11:30'. */
export function addMinutes(time: string, minutes: number): string {
  const [hour, minute] = time.split(':').map(Number);
  const total = hour * 60 + minute + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

export function isMorning(time: string): boolean {
  return Number(time.split(':')[0]) < 12;
}

export function getDaySlots(dateKey: string, appointments: Appointment[], now: Date): DaySlot[] {
  const booked = new Set(appointments.filter((a) => a.date === dateKey).map((a) => a.time));

  return generateTimeSlots().map((time) => ({
    time,
    available: !booked.has(time) && toDateTime(dateKey, time).getTime() > now.getTime(),
  }));
}

export function isUpcoming(appointment: Pick<Appointment, 'date' | 'time'>, now: Date): boolean {
  return toDateTime(appointment.date, appointment.time).getTime() >= now.getTime();
}
