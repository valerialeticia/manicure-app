import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingView } from '../BookingView';
import { useBookingPresenter, type BookingPresenter } from '../useBookingPresenter';

// A View só desenha a tela: aqui o presenter é substituído por um "dublê"
// para conferir que ela mostra as informações e repassa os toques da cliente.
jest.mock('../useBookingPresenter');
const mockedUseBookingPresenter = jest.mocked(useBookingPresenter);

function criarPresenter(alteracoes: Partial<BookingPresenter> = {}): BookingPresenter {
  return {
    isLoading: false,
    isSaving: false,
    services: [
      {
        id: 'manicure',
        name: 'Manicure',
        description: 'Cutilagem e esmaltação tradicional das mãos.',
        priceLabel: 'R$ 35,00',
        durationLabel: '45 min',
        isSelected: false,
      },
    ],
    date: '2026-11-10',
    minDate: '2026-11-10',
    monthLabel: 'Novembro de 2026',
    days: [
      { dateKey: '2026-11-10', weekdayLabel: 'ter', dayLabel: '10', monthLabel: 'nov', isSelected: true },
      { dateKey: '2026-11-11', weekdayLabel: 'qua', dayLabel: '11', monthLabel: 'nov', isSelected: false },
    ],
    slots: [
      { time: '09:00', isAvailable: true, isSelected: false },
      { time: '10:00', isAvailable: false, isSelected: false },
    ],
    slotGroups: [
      {
        label: 'Manhã',
        slots: [
          { time: '09:00', isAvailable: true, isSelected: false },
          { time: '10:00', isAvailable: false, isSelected: false },
        ],
      },
    ],
    hasAvailableSlots: true,
    summary: {
      serviceName: null,
      priceLabel: 'R$ 0,00',
      durationLabel: null,
      dateLabel: 'Terça-feira, 10/11',
      timeRangeLabel: null,
      isComplete: false,
    },
    clientName: '',
    clientPhone: '',
    errors: {},
    successMessage: null,
    errorMessage: null,
    upcomingAppointments: [],
    selectService: jest.fn(),
    changeDate: jest.fn(),
    selectTime: jest.fn(),
    changeName: jest.fn(),
    changePhone: jest.fn(),
    submit: jest.fn(async (event?: { preventDefault: () => void }) => event?.preventDefault()),
    cancelAppointment: jest.fn(async () => undefined),
    ...alteracoes,
  };
}

function mostrarTela(alteracoes: Partial<BookingPresenter> = {}) {
  const presenter = criarPresenter(alteracoes);
  mockedUseBookingPresenter.mockReturnValue(presenter);
  render(<BookingView />);
  return { presenter, user: userEvent.setup() };
}

describe('Tela de agendamento (visual)', () => {
  it('mostra um aviso enquanto a agenda está carregando', () => {
    mostrarTela({ isLoading: true });

    expect(screen.getByText('Carregando agenda…')).toBeInTheDocument();
  });

  it('mostra os serviços com preço e duração', () => {
    mostrarTela();

    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('45 min · R$ 35,00')).toBeInTheDocument();
  });

  it('quando a cliente toca em um serviço, ele é escolhido', async () => {
    const { presenter, user } = mostrarTela();

    await user.click(screen.getByRole('button', { name: /manicure/i }));

    expect(presenter.selectService).toHaveBeenCalledWith('manicure');
  });

  it('horários ocupados aparecem bloqueados e os livres podem ser escolhidos', async () => {
    const { presenter, user } = mostrarTela();

    expect(screen.getByRole('button', { name: '10:00' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '09:00' }));
    expect(presenter.selectTime).toHaveBeenCalledWith('09:00');
  });

  it('quando a cliente toca em um dia da fileira, ele é escolhido', async () => {
    const { presenter, user } = mostrarTela();

    expect(screen.getByRole('button', { name: 'ter 10 de nov' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'qua 11 de nov' }));
    expect(presenter.changeDate).toHaveBeenCalledWith('2026-11-11');
  });

  it('o resumo mostra o serviço escolhido, o horário e o total', () => {
    mostrarTela({
      summary: {
        serviceName: 'Pé e mão',
        priceLabel: 'R$ 70,00',
        durationLabel: '1h30',
        dateLabel: 'Terça-feira, 10/11',
        timeRangeLabel: '14:00–15:30',
        isComplete: true,
      },
    });

    const resumo = screen.getByRole('complementary', { name: 'Resumo do agendamento' });
    expect(resumo).toHaveTextContent('Pé e mão');
    expect(resumo).toHaveTextContent('Terça-feira, 10/11 · 14:00–15:30');
    expect(resumo).toHaveTextContent('Duração estimada: 1h30');
  });

  it('o botão de confirmar da barra do celular também envia o agendamento', async () => {
    const { presenter, user } = mostrarTela();

    await user.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(presenter.submit).toHaveBeenCalled();
  });

  it('avisa quando o dia escolhido não tem mais horários livres', () => {
    mostrarTela({ hasAvailableSlots: false });

    expect(screen.getByText('Não há horários livres neste dia. Tente outra data.')).toBeInTheDocument();
  });

  it('repassa o nome e o telefone digitados pela cliente', async () => {
    const { presenter, user } = mostrarTela();

    await user.type(screen.getByLabelText('Nome'), 'A');
    await user.type(screen.getByLabelText('Telefone (WhatsApp)'), '1');

    expect(presenter.changeName).toHaveBeenCalledWith('A');
    expect(presenter.changePhone).toHaveBeenCalledWith('1');
  });

  it('mostra os avisos de informações que faltam', () => {
    mostrarTela({ errors: { clientName: 'Informe seu nome.', time: 'Escolha um horário.' } });

    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Escolha um horário.')).toBeInTheDocument();
  });

  it('envia o agendamento ao tocar em confirmar', async () => {
    const { presenter, user } = mostrarTela();

    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }));

    expect(presenter.submit).toHaveBeenCalled();
  });

  it('bloqueia o botão de confirmar enquanto está salvando', () => {
    mostrarTela({ isSaving: true });

    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });

  it('mostra a mensagem de sucesso depois de agendar', () => {
    mostrarTela({ successMessage: 'Agendamento confirmado!' });

    expect(screen.getByRole('status')).toHaveTextContent('Agendamento confirmado!');
  });

  it('avisa quando a cliente ainda não tem horários marcados', () => {
    mostrarTela();

    expect(screen.getByText('Você ainda não tem horários marcados.')).toBeInTheDocument();
  });

  it('lista os próximos agendamentos e permite cancelar', async () => {
    const { presenter, user } = mostrarTela({
      upcomingAppointments: [
        {
          id: 'reserva-1',
          serviceName: 'Pedicure',
          dateLabel: 'Terça-feira, 10/11',
          time: '15:00',
          clientName: 'Ana',
        },
      ],
    });

    expect(screen.getByText('Pedicure')).toBeInTheDocument();
    expect(screen.getByText('Terça-feira, 10/11 às 15:00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar pedicure/i }));
    expect(presenter.cancelAppointment).toHaveBeenCalledWith('reserva-1');
  });
});
