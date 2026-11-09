# Agenda Manicure

Aplicação de agendamento de manicure feita com **Next.js (App Router) + React + TypeScript**, instalável como **PWA**.

## Como rodar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:3000
npm test           # testes unitários
npm run typecheck  # checagem de tipos
npm run build && npm start   # versão de produção (necessária para testar o PWA/offline)
```

> O service worker só é registrado em produção (`npm run build && npm start`), para o cache não atrapalhar o desenvolvimento.

## Arquitetura (MVP)

```
src/
├── app/                      # Rotas do Next (só montam as telas) + manifest do PWA
├── models/                   # MODEL: dados, regras de negócio e acesso aos dados (sem React)
│   ├── service.ts            #   catálogo de serviços
│   ├── appointment.ts        #   tipo Agendamento
│   ├── schedule.ts           #   horários de funcionamento e disponibilidade
│   ├── bookingValidation.ts  #   conferência do formulário
│   ├── formatters.ts         #   preço, duração, data e telefone
│   └── appointmentRepository.ts  # onde os agendamentos ficam salvos (localStorage / memória)
└── features/
    ├── booking/
    │   ├── BookingView.tsx         # VIEW: apenas desenha a tela e repassa os eventos
    │   └── useBookingPresenter.ts  # PRESENTER: estado, regras da tela e chamadas ao model
    └── pwa/
        ├── ServiceWorkerRegister.tsx
        └── useServiceWorkerPresenter.ts
public/
├── sw.js        # service worker (cache offline)
└── icons/       # ícones do app instalado
```

Regras do padrão:

- **View (`*.tsx`)** não tem lógica: recebe tudo pronto do presenter (textos formatados, flags como `isSelected`, `isAvailable`) e só chama as ações dele.
- **Presenter (`use*Presenter.ts`)** concentra o estado e a lógica da tela e expõe para a View um objeto com dados de exibição + ações.
- **Model** não conhece React. O repositório é uma interface — trocar o `localStorage` por uma API no futuro não exige mudar o presenter.

## Testes

Os testes ficam em pastas `__tests__` ao lado do código e têm descrições em linguagem simples
(ex.: _"não deixa escolher um horário que já passou"_).

- Model: testado diretamente.
- Presenter: testado com `renderHook` e um repositório em memória.
- View: testada com o presenter substituído por um dublê, conferindo apenas o que aparece na tela e o que é repassado.

## Próximos passos sugeridos

- Considerar a duração do serviço ao bloquear horários (ex.: "Pé e mão" ocupa 1h30).
- Dias de folga / horário diferente aos sábados.
- Back-end real (API + banco) implementando `AppointmentRepository`.
- Área da manicure para ver a agenda do dia.
- Lembrete por WhatsApp / notificação push.
