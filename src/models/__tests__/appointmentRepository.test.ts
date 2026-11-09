import { createLocalStorageRepository, STORAGE_KEY } from '../appointmentRepository';

const novoAgendamento = {
  serviceId: 'manicure',
  date: '2026-11-10',
  time: '10:00',
  clientName: 'Ana',
  clientPhone: '(11) 91234-5678',
};

describe('Agendamentos guardados no aparelho', () => {
  beforeEach(() => window.localStorage.clear());

  it('começa sem nenhum agendamento', async () => {
    const agenda = createLocalStorageRepository();

    expect(await agenda.list()).toEqual([]);
  });

  it('guarda o agendamento para a cliente ver depois', async () => {
    const agenda = createLocalStorageRepository();
    const salvo = await agenda.save(novoAgendamento);

    const outraVisita = createLocalStorageRepository();
    expect(await outraVisita.list()).toEqual([salvo]);
  });

  it('remove o agendamento cancelado', async () => {
    const agenda = createLocalStorageRepository();
    const salvo = await agenda.save(novoAgendamento);

    await agenda.remove(salvo.id);

    expect(await agenda.list()).toEqual([]);
  });

  it('não quebra se os dados salvos estiverem estragados', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{isso não é válido');

    expect(await createLocalStorageRepository().list()).toEqual([]);
  });
});
