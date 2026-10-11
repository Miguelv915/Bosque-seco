import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn().mockResolvedValue({ error: null });
const single = vi.fn().mockResolvedValue({ data: { id: 'req-1' }, error: null });

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    from: () => ({ insert: () => ({ select: () => ({ single }) }) }),
    rpc: (...args) => rpc(...args),
  },
}));

const request = {
  associationId: 'a1',
  entityType: 'association',
  action: 'update',
  payload: { summary_es: 'x' },
};

describe('createRequest', () => {
  beforeEach(() => {
    vi.resetModules();
    rpc.mockClear();
  });

  it('publica al instante cuando no hay aprobación', async () => {
    vi.doMock('../config/features', () => ({ features: { approvals: false } }));
    const { createRequest } = await import('./changeRequests.service');
    await createRequest(request);
    expect(rpc).toHaveBeenCalledWith('approve_change_request', { p_request_id: 'req-1' });
  });

  it('deja la solicitud pendiente cuando hay aprobación', async () => {
    vi.doMock('../config/features', () => ({ features: { approvals: true } }));
    const { createRequest } = await import('./changeRequests.service');
    await createRequest(request);
    expect(rpc).not.toHaveBeenCalled();
  });
});
