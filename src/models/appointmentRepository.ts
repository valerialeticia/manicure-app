import { createAppointmentId, type Appointment, type NewAppointment } from './appointment';

/**
 * Contrato de acesso aos agendamentos. Hoje os dados ficam no aparelho (localStorage);
 * no futuro basta criar outra implementação (ex.: chamando uma API) sem mexer no presenter.
 */
export interface AppointmentRepository {
  list(): Promise<Appointment[]>;
  save(data: NewAppointment): Promise<Appointment>;
  remove(id: string): Promise<void>;
}

export const STORAGE_KEY = 'manicure:agendamentos';

function buildAppointment(data: NewAppointment): Appointment {
  return { ...data, id: createAppointmentId(), createdAt: new Date().toISOString() };
}

export function createLocalStorageRepository(
  getStorage: () => Storage = () => window.localStorage,
): AppointmentRepository {
  const read = (): Appointment[] => {
    try {
      const raw = getStorage().getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as Appointment[]) : [];
    } catch {
      return [];
    }
  };

  const write = (appointments: Appointment[]) => {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(appointments));
  };

  return {
    async list() {
      return read();
    },
    async save(data) {
      const appointment = buildAppointment(data);
      write([...read(), appointment]);
      return appointment;
    },
    async remove(id) {
      write(read().filter((appointment) => appointment.id !== id));
    },
  };
}

export function createInMemoryRepository(initial: Appointment[] = []): AppointmentRepository {
  let appointments = [...initial];

  return {
    async list() {
      return [...appointments];
    },
    async save(data) {
      const appointment = buildAppointment(data);
      appointments = [...appointments, appointment];
      return appointment;
    },
    async remove(id) {
      appointments = appointments.filter((appointment) => appointment.id !== id);
    },
  };
}
