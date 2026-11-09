'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { compareByDateTime, type Appointment } from '@/models/appointment';
import {
  createLocalStorageRepository,
  type AppointmentRepository,
} from '@/models/appointmentRepository';
import {
  emptyBookingForm,
  hasErrors,
  validateBooking,
  type BookingErrors,
  type BookingForm,
} from '@/models/bookingValidation';
import {
  formatDateLabel,
  formatDayParts,
  formatDuration,
  formatMonthYear,
  formatPhone,
  formatPrice,
} from '@/models/formatters';
import {
  addMinutes,
  getDaySlots,
  getUpcomingDays,
  isMorning,
  isUpcoming,
  toDateKey,
} from '@/models/schedule';
import { findService, SERVICES } from '@/models/service';

export interface BookingPresenterOptions {
  repository?: AppointmentRepository;
  now?: () => Date;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  durationLabel: string;
  isSelected: boolean;
}

export interface SlotItem {
  time: string;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface DayItem {
  dateKey: string;
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
  isSelected: boolean;
}

export interface SlotGroup {
  label: string;
  slots: SlotItem[];
}

export interface BookingSummary {
  /** Nome do serviço escolhido, ou null se nenhum foi escolhido ainda. */
  serviceName: string | null;
  priceLabel: string;
  durationLabel: string | null;
  dateLabel: string;
  /** Ex.: "14:00–14:45", ou null se o horário ainda não foi escolhido. */
  timeRangeLabel: string | null;
  isComplete: boolean;
}

/** Quantos dias aparecem na fileira de datas. */
export const DAYS_AHEAD = 14;

export interface UpcomingAppointmentItem {
  id: string;
  serviceName: string;
  dateLabel: string;
  time: string;
  clientName: string;
}

type SubmitEvent = { preventDefault: () => void };

const defaultNow = () => new Date();

export function useBookingPresenter({ repository, now = defaultNow }: BookingPresenterOptions = {}) {
  const repo = useMemo(() => repository ?? createLocalStorageRepository(), [repository]);
  const [clock] = useState(() => now);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [today, setToday] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState<BookingForm>(emptyBookingForm);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // A agenda só é carregada no navegador, evitando diferenças de fuso entre servidor e aparelho.
  useEffect(() => {
    let active = true;
    const todayKey = toDateKey(clock());

    repo
      .list()
      .then((list) => {
        if (active) setAppointments(list);
      })
      .catch(() => {
        if (active) setErrorMessage('Não foi possível carregar a agenda. Tente novamente.');
      })
      .finally(() => {
        if (!active) return;
        setToday(todayKey);
        setForm((current) => ({ ...current, date: current.date || todayKey }));
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [repo, clock]);

  const updateForm = useCallback((changes: Partial<BookingForm>) => {
    setForm((current) => ({ ...current, ...changes }));
    setErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(changes) as (keyof BookingForm)[]) delete next[field];
      return next;
    });
    setSuccessMessage(null);
  }, []);

  const daySlots = useMemo(
    () => (form.date ? getDaySlots(form.date, appointments, clock()) : []),
    [form.date, appointments, clock],
  );

  const services: ServiceItem[] = useMemo(
    () =>
      SERVICES.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        priceLabel: formatPrice(service.price),
        durationLabel: formatDuration(service.durationMinutes),
        isSelected: service.id === form.serviceId,
      })),
    [form.serviceId],
  );

  const slots: SlotItem[] = useMemo(
    () =>
      daySlots.map((slot) => ({
        time: slot.time,
        isAvailable: slot.available,
        isSelected: slot.time === form.time,
      })),
    [daySlots, form.time],
  );

  const days: DayItem[] = useMemo(
    () =>
      today
        ? getUpcomingDays(today, DAYS_AHEAD).map((dateKey) => {
            const parts = formatDayParts(dateKey);
            return {
              dateKey,
              weekdayLabel: parts.weekday,
              dayLabel: parts.day,
              monthLabel: parts.month,
              isSelected: dateKey === form.date,
            };
          })
        : [],
    [today, form.date],
  );

  const slotGroups: SlotGroup[] = useMemo(
    () =>
      [
        { label: 'Manhã', slots: slots.filter((slot) => isMorning(slot.time)) },
        { label: 'Tarde', slots: slots.filter((slot) => !isMorning(slot.time)) },
      ].filter((group) => group.slots.length > 0),
    [slots],
  );

  const summary: BookingSummary = useMemo(() => {
    const service = findService(form.serviceId);
    return {
      serviceName: service?.name ?? null,
      priceLabel: formatPrice(service?.price ?? 0),
      durationLabel: service ? formatDuration(service.durationMinutes) : null,
      dateLabel: form.date ? formatDateLabel(form.date) : '',
      timeRangeLabel: form.time
        ? service
          ? `${form.time}–${addMinutes(form.time, service.durationMinutes)}`
          : form.time
        : null,
      isComplete: Boolean(service && form.date && form.time),
    };
  }, [form.serviceId, form.date, form.time]);

  const upcomingAppointments: UpcomingAppointmentItem[] = useMemo(() => {
    const current = clock();
    return appointments
      .filter((appointment) => isUpcoming(appointment, current))
      .sort(compareByDateTime)
      .map((appointment) => ({
        id: appointment.id,
        serviceName: findService(appointment.serviceId)?.name ?? 'Serviço',
        dateLabel: formatDateLabel(appointment.date),
        time: appointment.time,
        clientName: appointment.clientName,
      }));
  }, [appointments, clock]);

  const isSlotAvailable = useCallback(
    (time: string) => daySlots.some((slot) => slot.time === time && slot.available),
    [daySlots],
  );

  const selectService = useCallback((serviceId: string) => updateForm({ serviceId }), [updateForm]);

  const changeDate = useCallback((date: string) => updateForm({ date, time: '' }), [updateForm]);

  const selectTime = useCallback(
    (time: string) => {
      if (isSlotAvailable(time)) updateForm({ time });
    },
    [isSlotAvailable, updateForm],
  );

  const changeName = useCallback((clientName: string) => updateForm({ clientName }), [updateForm]);

  const changePhone = useCallback(
    (value: string) => updateForm({ clientPhone: formatPhone(value) }),
    [updateForm],
  );

  const submit = useCallback(
    async (event?: SubmitEvent) => {
      event?.preventDefault();
      if (isSaving) return;

      const validation = validateBooking(form);
      if (form.time && !isSlotAvailable(form.time)) {
        validation.time = 'Esse horário não está mais disponível. Escolha outro.';
      }
      if (hasErrors(validation)) {
        setErrors(validation);
        setSuccessMessage(null);
        return;
      }

      setIsSaving(true);
      setErrorMessage(null);
      try {
        const saved = await repo.save({
          serviceId: form.serviceId,
          date: form.date,
          time: form.time,
          clientName: form.clientName.trim(),
          clientPhone: form.clientPhone,
        });
        setAppointments((current) => [...current, saved]);
        setForm({ ...emptyBookingForm, date: form.date });
        setErrors({});
        setSuccessMessage(
          `Agendamento confirmado! ${findService(saved.serviceId)?.name} em ${formatDateLabel(saved.date)} às ${saved.time}.`,
        );
      } catch {
        setErrorMessage('Não foi possível salvar o agendamento. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    },
    [form, isSaving, isSlotAvailable, repo],
  );

  const cancelAppointment = useCallback(
    async (id: string) => {
      setErrorMessage(null);
      try {
        await repo.remove(id);
        setAppointments((current) => current.filter((appointment) => appointment.id !== id));
        setSuccessMessage('Agendamento cancelado.');
      } catch {
        setErrorMessage('Não foi possível cancelar o agendamento. Tente novamente.');
      }
    },
    [repo],
  );

  return {
    isLoading,
    isSaving,
    services,
    date: form.date,
    minDate: today,
    monthLabel: form.date ? formatMonthYear(form.date) : '',
    days,
    slots,
    slotGroups,
    hasAvailableSlots: slots.some((slot) => slot.isAvailable),
    summary,
    clientName: form.clientName,
    clientPhone: form.clientPhone,
    errors,
    successMessage,
    errorMessage,
    upcomingAppointments,
    selectService,
    changeDate,
    selectTime,
    changeName,
    changePhone,
    submit,
    cancelAppointment,
  };
}

export type BookingPresenter = ReturnType<typeof useBookingPresenter>;
