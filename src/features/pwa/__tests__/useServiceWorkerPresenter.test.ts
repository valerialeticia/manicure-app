import { renderHook, waitFor } from '@testing-library/react';
import { useServiceWorkerPresenter } from '../useServiceWorkerPresenter';

describe('Uso do app instalado e sem internet', () => {
  const register = jest.fn();

  beforeEach(() => {
    register.mockReset().mockResolvedValue({});
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    });
  });

  it('prepara o app para funcionar offline quando está publicado', async () => {
    renderHook(() => useServiceWorkerPresenter(true));

    await waitFor(() => expect(register).toHaveBeenCalledWith('/sw.js'));
  });

  it('não ativa o modo offline durante o desenvolvimento', () => {
    renderHook(() => useServiceWorkerPresenter(false));

    expect(register).not.toHaveBeenCalled();
  });
});
