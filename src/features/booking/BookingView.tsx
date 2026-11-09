'use client';

import styles from './BookingView.module.css';
import { useBookingPresenter } from './useBookingPresenter';

const FORM_ID = 'form-agendamento';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={styles.fieldError}>{message}</p>;
}

function Icon({ name }: { name: 'calendar' | 'list' | 'clock' | 'check' }) {
  const paths = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="M5 12.5 10 17 19 7" />,
  };
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'check' ? 3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true" />
      <span className={styles.brandName}>Agenda Manicure</span>
    </div>
  );
}

export function BookingView() {
  const presenter = useBookingPresenter();

  if (presenter.isLoading) {
    return (
      <main className={styles.loadingPage}>
        <p className={styles.loading} role="status">
          Carregando agenda…
        </p>
      </main>
    );
  }

  const { summary } = presenter;

  return (
    <div className={styles.app}>
      {/* Barra lateral no computador; vira barra no topo no tablet e no celular */}
      <aside className={styles.sidebar}>
        <Brand />
        <nav className={styles.nav} aria-label="Principal">
          <a href="#agendar" aria-current="page">
            <Icon name="calendar" />
            Agendar
          </a>
          <a href="#meus-horarios">
            <Icon name="list" />
            Meus horários
          </a>
        </nav>
      </aside>

      <main className={styles.main} id="agendar">
        <header className={styles.pageHead}>
          <span className={styles.eyebrow}>Novo agendamento</span>
          <h1>
            Reserve seu horário <em>em poucos toques</em>
          </h1>
          <p>Escolha o serviço, o dia e o horário que preferir. A confirmação aparece na hora.</p>
        </header>

        {presenter.errorMessage && (
          <p role="alert" className={styles.errorBanner}>
            {presenter.errorMessage}
          </p>
        )}
        {presenter.successMessage && (
          <p role="status" className={styles.success}>
            <Icon name="check" />
            {presenter.successMessage}
          </p>
        )}

        <form id={FORM_ID} className={styles.form} onSubmit={presenter.submit} noValidate>
          <section className={styles.step} aria-labelledby="titulo-servicos">
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>1</span>
              <h2 id="titulo-servicos">Escolha o serviço</h2>
            </div>
            <div className={styles.services}>
              {presenter.services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={styles.service}
                  aria-pressed={service.isSelected}
                  onClick={() => presenter.selectService(service.id)}
                >
                  <span className={styles.serviceName}>{service.name}</span>
                  <span className={styles.check} aria-hidden="true">
                    <Icon name="check" />
                  </span>
                  <span className={styles.serviceDescription}>{service.description}</span>
                  <span className={styles.serviceMeta}>
                    {service.durationLabel} · {service.priceLabel}
                  </span>
                </button>
              ))}
            </div>
            <FieldError message={presenter.errors.serviceId} />
          </section>

          <section className={styles.step} aria-labelledby="titulo-horario">
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>2</span>
              <h2 id="titulo-horario">Escolha o dia e o horário</h2>
              <span className={styles.stepHint}>{presenter.monthLabel}</span>
            </div>

            <div className={styles.dates} role="group" aria-label="Dias">
              {presenter.days.map((day) => (
                <button
                  key={day.dateKey}
                  type="button"
                  className={styles.date}
                  aria-pressed={day.isSelected}
                  aria-label={`${day.weekdayLabel} ${day.dayLabel} de ${day.monthLabel}`}
                  onClick={() => presenter.changeDate(day.dateKey)}
                >
                  <span className={styles.dateWeekday}>{day.weekdayLabel}</span>
                  <span className={styles.dateDay}>{day.dayLabel}</span>
                  <span className={styles.dateMonth}>{day.monthLabel}</span>
                </button>
              ))}
            </div>
            <FieldError message={presenter.errors.date} />

            {presenter.slotGroups.map((group) => (
              <div key={group.label} className={styles.period}>
                <span className={styles.periodLabel}>{group.label}</span>
                <div className={styles.slots} role="group" aria-label={`Horários da ${group.label.toLowerCase()}`}>
                  {group.slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      className={styles.slot}
                      aria-pressed={slot.isSelected}
                      disabled={!slot.isAvailable}
                      onClick={() => presenter.selectTime(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!presenter.hasAvailableSlots && (
              <p className={styles.hint}>Não há horários livres neste dia. Tente outra data.</p>
            )}
            <div className={styles.legend} aria-hidden="true">
              <span>
                <i />
                Disponível
              </span>
              <span>
                <i className={styles.legendSelected} />
                Selecionado
              </span>
              <span>
                <i className={styles.legendTaken} />
                Ocupado
              </span>
            </div>
            <FieldError message={presenter.errors.time} />
          </section>

          <section className={styles.step} aria-labelledby="titulo-dados">
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>3</span>
              <h2 id="titulo-dados">Seus dados</h2>
            </div>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="nome">
                  Nome
                </label>
                <input
                  id="nome"
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  value={presenter.clientName}
                  onChange={(event) => presenter.changeName(event.target.value)}
                />
                <FieldError message={presenter.errors.clientName} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="telefone">
                  Telefone (WhatsApp)
                </label>
                <input
                  id="telefone"
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="(11) 91234-5678"
                  value={presenter.clientPhone}
                  onChange={(event) => presenter.changePhone(event.target.value)}
                />
                <FieldError message={presenter.errors.clientPhone} />
              </div>
            </div>
          </section>
        </form>

        <section className={styles.step} id="meus-horarios" aria-labelledby="titulo-agendamentos">
          <div className={styles.stepHead}>
            <h2 id="titulo-agendamentos">Meus agendamentos</h2>
          </div>
          {presenter.upcomingAppointments.length === 0 ? (
            <p className={styles.hint}>Você ainda não tem horários marcados.</p>
          ) : (
            <ul className={styles.appointments}>
              {presenter.upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className={styles.appointment}>
                  <div>
                    <strong>{appointment.serviceName}</strong>
                    <span>
                      {appointment.dateLabel} às {appointment.time}
                    </span>
                    <span className={styles.hint}>{appointment.clientName}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.cancel}
                    aria-label={`Cancelar ${appointment.serviceName} de ${appointment.dateLabel} às ${appointment.time}`}
                    onClick={() => presenter.cancelAppointment(appointment.id)}
                  >
                    Cancelar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Resumo fixo à direita (computador e tablet) */}
      <aside className={styles.summaryCol} aria-label="Resumo do agendamento">
        <div className={styles.summary}>
          <div>
            <span className={styles.eyebrow}>Resumo</span>
            <h2 className={styles.summaryTitle}>Seu horário</h2>
          </div>

          {summary.serviceName ? (
            <div className={styles.summaryLine}>
              <span>{summary.serviceName}</span>
              <span>{summary.priceLabel}</span>
            </div>
          ) : (
            <p className={styles.hint}>Nenhum serviço escolhido ainda.</p>
          )}

          <div className={styles.summaryBlock}>
            <div className={styles.summaryRow}>
              <Icon name="calendar" />
              <span>
                {summary.dateLabel}
                {summary.timeRangeLabel ? ` · ${summary.timeRangeLabel}` : ' · escolha um horário'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <Icon name="clock" />
              <span>Duração estimada: {summary.durationLabel ?? '—'}</span>
            </div>
          </div>

          <div className={styles.total}>
            <span>Total</span>
            <strong>{summary.priceLabel}</strong>
          </div>

          <button className={styles.submit} type="submit" form={FORM_ID} disabled={presenter.isSaving}>
            {presenter.isSaving ? 'Salvando…' : 'Confirmar agendamento'}
          </button>
          <p className={styles.fine}>Pagamento no salão.</p>
        </div>
      </aside>

      {/* Celular: barra com total + botão, e navegação no rodapé */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileInfo}>
          <small>
            {summary.timeRangeLabel
              ? `${summary.dateLabel} · ${summary.timeRangeLabel}`
              : 'Escolha o dia e o horário'}
          </small>
          <strong>{summary.priceLabel}</strong>
        </div>
        <button className={styles.submit} type="submit" form={FORM_ID} disabled={presenter.isSaving}>
          Confirmar
        </button>
      </div>
      <nav className={styles.tabbar} aria-label="Navegação inferior">
        <a href="#agendar" aria-current="page">
          <Icon name="calendar" />
          Agendar
        </a>
        <a href="#meus-horarios">
          <Icon name="list" />
          Meus horários
        </a>
      </nav>
    </div>
  );
}
