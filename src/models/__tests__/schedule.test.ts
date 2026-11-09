import type { Appointment } from '../appointment';
import {
  addMinutes,
  generateTimeSlots,
  getDaySlots,
  getUpcomingDays,
  isMorning,
  isUpcoming,
} from '../schedule';

const appointment = (date: string, time: string): Appointment => ({
  id: `${date}-${time}`,
  serviceId: 'manicure',
  date,
  time,
  clientName: 'Ana',
  clientPhone: '(11) 91234-5678',
  createdAt: '2026-11-01T10:00:00.000Z',
});

describe('Horários de atendimento', () => {
  it('oferece horários de hora em hora, das 9h até o último atendimento às 17h', () => {
    expect(generateTimeSlots()).toEqual([
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    ]);
  });

  it('não deixa escolher um horário que já passou', () => {
    const agora = new Date(2026, 10, 10, 12, 30);
    const horarios = getDaySlots('2026-11-10', [], agora);

    expect(horarios.find((h) => h.time === '11:00')?.available).toBe(false);
    expect(horarios.find((h) => h.time === '13:00')?.available).toBe(true);
  });

  it('mostra como ocupado o horário que outra cliente já reservou', () => {
    const agora = new Date(2026, 10, 10, 8, 0);
    const horarios = getDaySlots('2026-11-10', [appointment('2026-11-10', '10:00')], agora);

    expect(horarios.find((h) => h.time === '10:00')?.available).toBe(false);
    expect(horarios.find((h) => h.time === '11:00')?.available).toBe(true);
  });

  it('uma reserva em outro dia não ocupa o horário de hoje', () => {
    const agora = new Date(2026, 10, 10, 8, 0);
    const horarios = getDaySlots('2026-11-10', [appointment('2026-11-11', '10:00')], agora);

    expect(horarios.find((h) => h.time === '10:00')?.available).toBe(true);
  });

  it('sabe dizer se um agendamento ainda vai acontecer ou se já passou', () => {
    const agora = new Date(2026, 10, 10, 12, 0);

    expect(isUpcoming({ date: '2026-11-10', time: '15:00' }, agora)).toBe(true);
    expect(isUpcoming({ date: '2026-11-09', time: '15:00' }, agora)).toBe(false);
  });

  it('lista os próximos dias, virando o mês quando precisa', () => {
    expect(getUpcomingDays('2026-11-29', 4)).toEqual([
      '2026-11-29', '2026-11-30', '2026-12-01', '2026-12-02',
    ]);
  });

  it('calcula a que horas o atendimento termina', () => {
    expect(addMinutes('10:00', 45)).toBe('10:45');
    expect(addMinutes('16:00', 90)).toBe('17:30');
  });

  it('separa os horários da manhã dos da tarde', () => {
    expect(isMorning('11:00')).toBe(true);
    expect(isMorning('12:00')).toBe(false);
  });
});
