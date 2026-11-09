export interface Appointment {
  id: string;
  serviceId: string;
  /** Data no formato AAAA-MM-DD */
  date: string;
  /** Horário no formato HH:mm */
  time: string;
  clientName: string;
  clientPhone: string;
  createdAt: string;
}

export type NewAppointment = Omit<Appointment, 'id' | 'createdAt'>;

export function createAppointmentId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function compareByDateTime(a: Appointment, b: Appointment): number {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}
