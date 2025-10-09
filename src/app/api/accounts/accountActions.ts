export interface RegisterAction {
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'GET';
}

export function resolveAccountAction(action: string, payload: any): RegisterAction | null {
  switch (action) {

    case 'create-user':
      return { endpoint: '/accounts/register', method: 'POST' };

    case 'create-account':
      return { endpoint: '/accounts/create', method: 'POST' };

    default:
      return null;
  }
}