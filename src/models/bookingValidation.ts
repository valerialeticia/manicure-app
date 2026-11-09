export interface BookingForm {
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
}

export type BookingErrors = Partial<Record<keyof BookingForm, string>>;

export const emptyBookingForm: BookingForm = {
  serviceId: '',
  date: '',
  time: '',
  clientName: '',
  clientPhone: '',
};

export function validateBooking(form: BookingForm): BookingErrors {
  const errors: BookingErrors = {};

  if (!form.serviceId) errors.serviceId = 'Escolha um serviço.';
  if (!form.date) errors.date = 'Escolha um dia.';
  if (!form.time) errors.time = 'Escolha um horário.';
  if (form.clientName.trim().length < 2) errors.clientName = 'Informe seu nome.';

  const phoneDigits = form.clientPhone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.clientPhone = 'Informe um telefone com DDD.';
  }

  return errors;
}

export function hasErrors(errors: BookingErrors): boolean {
  return Object.keys(errors).length > 0;
}
