import { hasErrors, validateBooking, type BookingForm } from '../bookingValidation';

const formularioCompleto: BookingForm = {
  serviceId: 'manicure',
  date: '2026-11-10',
  time: '10:00',
  clientName: 'Ana Souza',
  clientPhone: '(11) 91234-5678',
};

describe('Conferência dos dados do agendamento', () => {
  it('aceita o agendamento quando tudo está preenchido', () => {
    expect(hasErrors(validateBooking(formularioCompleto))).toBe(false);
  });

  it('pede para escolher o serviço, o dia e o horário', () => {
    const erros = validateBooking({ ...formularioCompleto, serviceId: '', date: '', time: '' });

    expect(erros.serviceId).toBe('Escolha um serviço.');
    expect(erros.date).toBe('Escolha um dia.');
    expect(erros.time).toBe('Escolha um horário.');
  });

  it('pede o nome da cliente', () => {
    expect(validateBooking({ ...formularioCompleto, clientName: '  ' }).clientName).toBe(
      'Informe seu nome.',
    );
  });

  it('não aceita telefone sem DDD', () => {
    expect(validateBooking({ ...formularioCompleto, clientPhone: '91234-5678' }).clientPhone).toBe(
      'Informe um telefone com DDD.',
    );
  });

  it('aceita telefone fixo com DDD', () => {
    expect(validateBooking({ ...formularioCompleto, clientPhone: '(11) 3234-5678' }).clientPhone).toBeUndefined();
  });
});
