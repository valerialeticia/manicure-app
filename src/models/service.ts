export interface ManicureService {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export const SERVICES: ManicureService[] = [
  {
    id: 'manicure',
    name: 'Manicure',
    description: 'Cutilagem e esmaltação tradicional das mãos.',
    durationMinutes: 45,
    price: 35,
  },
  {
    id: 'pedicure',
    name: 'Pedicure',
    description: 'Cutilagem e esmaltação tradicional dos pés.',
    durationMinutes: 50,
    price: 40,
  },
  {
    id: 'pe-e-mao',
    name: 'Pé e mão',
    description: 'Combo completo para mãos e pés.',
    durationMinutes: 90,
    price: 70,
  },
  {
    id: 'gel',
    name: 'Esmaltação em gel',
    description: 'Mais brilho e duração de até 3 semanas.',
    durationMinutes: 60,
    price: 60,
  },
];

export function findService(id: string): ManicureService | undefined {
  return SERVICES.find((service) => service.id === id);
}
