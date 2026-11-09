import { act, renderHook, waitFor } from '@testing-library/react';
import type { Appointment } from '@/models/appointment';
import {
  createInMemoryRepository,
  type AppointmentRepository,
} from '@/models/appointmentRepository';
import { useBookingPresenter } from '../useBookingPresenter';

// Terça-feira, 10/11/2026, às 8h da manhã
const AGORA = new Date(2026, 10, 10, 8, 0);

const agendamentoExistente: Appointment = {
  id: 'reserva-1',
  serviceId: 'gel',
  date: '2026-11-10',
  time: '10:00',
  clientName: 'Beatriz',
  clientPhone: '(11) 98888-7777',
  createdAt: '2026-11-01T10:00:00.000Z',
};

async function abrirAgenda(repository: AppointmentRepository = createInMemoryRepository()) {
  const hook = renderHook(() => useBookingPresenter({ repository, now: () => AGORA }));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return { ...hook, repository };
}

describe('Tela de agendamento (regras)', () => {
  it('abre a agenda já no dia de hoje', async () => {
    const { result } = await abrirAgenda();

    expect(result.current.date).toBe('2026-11-10');
    expect(result.current.minDate).toBe('2026-11-10');
  });

  it('mostra todos os serviços com preço e duração', async () => {
    const { result } = await abrirAgenda();

    const manicure = result.current.services.find((s) => s.id === 'manicure');
    expect(manicure?.priceLabel).toMatch(/35,00/);
    expect(manicure?.durationLabel).toBe('45 min');
  });

  it('mostra como ocupado o horário que outra cliente já reservou', async () => {
    const { result } = await abrirAgenda(createInMemoryRepository([agendamentoExistente]));

    expect(result.current.slots.find((s) => s.time === '10:00')?.isAvailable).toBe(false);
  });

  it('não deixa escolher um horário ocupado', async () => {
    const { result } = await abrirAgenda(createInMemoryRepository([agendamentoExistente]));

    act(() => result.current.selectTime('10:00'));

    expect(result.current.slots.some((s) => s.isSelected)).toBe(false);
  });

  it('ao trocar de dia, o horário escolhido é desmarcado', async () => {
    const { result } = await abrirAgenda();

    act(() => result.current.selectTime('14:00'));
    expect(result.current.slots.find((s) => s.time === '14:00')?.isSelected).toBe(true);

    act(() => result.current.changeDate('2026-11-11'));
    expect(result.current.slots.some((s) => s.isSelected)).toBe(false);
  });

  it('mostra as próximas duas semanas para escolher o dia, começando por hoje', async () => {
    const { result } = await abrirAgenda();

    expect(result.current.days).toHaveLength(14);
    expect(result.current.days[0]).toMatchObject({
      dateKey: '2026-11-10',
      weekdayLabel: 'ter',
      dayLabel: '10',
      isSelected: true,
    });
    expect(result.current.monthLabel).toBe('Novembro de 2026');
  });

  it('separa os horários em manhã e tarde', async () => {
    const { result } = await abrirAgenda();

    expect(result.current.slotGroups.map((g) => g.label)).toEqual(['Manhã', 'Tarde']);
    expect(result.current.slotGroups[0].slots.map((s) => s.time)).toEqual(['09:00', '10:00', '11:00']);
  });

  it('o resumo mostra o serviço, o valor e a que horas o atendimento termina', async () => {
    const { result } = await abrirAgenda();
    expect(result.current.summary.serviceName).toBeNull();
    expect(result.current.summary.isComplete).toBe(false);

    act(() => result.current.selectService('pe-e-mao'));
    act(() => result.current.selectTime('14:00'));

    expect(result.current.summary).toMatchObject({
      serviceName: 'Pé e mão',
      durationLabel: '1h30',
      dateLabel: 'Terça-feira, 10/11',
      timeRangeLabel: '14:00–15:30',
      isComplete: true,
    });
    expect(result.current.summary.priceLabel).toMatch(/70,00/);
  });

  it('organiza o telefone enquanto a cliente digita', async () => {
    const { result } = await abrirAgenda();

    act(() => result.current.changePhone('11912345678'));

    expect(result.current.clientPhone).toBe('(11) 91234-5678');
  });

  it('avisa o que falta preencher quando a cliente tenta confirmar sem completar', async () => {
    const { result } = await abrirAgenda();

    await act(() => result.current.submit());

    expect(result.current.errors).toEqual({
      serviceId: 'Escolha um serviço.',
      time: 'Escolha um horário.',
      clientName: 'Informe seu nome.',
      clientPhone: 'Informe um telefone com DDD.',
    });
  });

  it('o aviso some assim que a cliente corrige a informação', async () => {
    const { result } = await abrirAgenda();
    await act(() => result.current.submit());

    act(() => result.current.changeName('Ana'));

    expect(result.current.errors.clientName).toBeUndefined();
    expect(result.current.errors.clientPhone).toBeDefined();
  });

  it('confirma o agendamento, mostra uma mensagem de sucesso e limpa o formulário', async () => {
    const { result, repository } = await abrirAgenda();

    act(() => result.current.selectService('manicure'));
    act(() => result.current.selectTime('14:00'));
    act(() => result.current.changeName('Ana Souza'));
    act(() => result.current.changePhone('11912345678'));
    await act(() => result.current.submit());

    expect(result.current.successMessage).toBe(
      'Agendamento confirmado! Manicure em Terça-feira, 10/11 às 14:00.',
    );
    expect(result.current.upcomingAppointments).toHaveLength(1);
    expect(result.current.slots.find((s) => s.time === '14:00')?.isAvailable).toBe(false);
    expect(result.current.clientName).toBe('');
    expect(await repository.list()).toHaveLength(1);
  });

  it('permite cancelar um agendamento e libera o horário', async () => {
    const { result } = await abrirAgenda(createInMemoryRepository([agendamentoExistente]));
    expect(result.current.upcomingAppointments).toHaveLength(1);

    await act(() => result.current.cancelAppointment('reserva-1'));

    expect(result.current.upcomingAppointments).toHaveLength(0);
    expect(result.current.slots.find((s) => s.time === '10:00')?.isAvailable).toBe(true);
    expect(result.current.successMessage).toBe('Agendamento cancelado.');
  });

  it('avisa a cliente quando não consegue salvar o agendamento', async () => {
    const repositorioComFalha: AppointmentRepository = {
      ...createInMemoryRepository(),
      save: () => Promise.reject(new Error('sem espaço')),
    };
    const { result } = await abrirAgenda(repositorioComFalha);

    act(() => result.current.selectService('pedicure'));
    act(() => result.current.selectTime('15:00'));
    act(() => result.current.changeName('Ana'));
    act(() => result.current.changePhone('11912345678'));
    await act(() => result.current.submit());

    expect(result.current.errorMessage).toBe('Não foi possível salvar o agendamento. Tente novamente.');
    expect(result.current.successMessage).toBeNull();
  });
});
