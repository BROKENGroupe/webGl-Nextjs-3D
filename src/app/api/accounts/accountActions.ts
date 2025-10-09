export interface RegisterAction {
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'GET';
}

export function resolveAccountAction(action: string, payload: any): RegisterAction | null {
  switch (action) {

    case 'create-user':
      return { endpoint: '/account/register', method: 'POST' };

    case 'create-account':
      return { endpoint: '/account/create', method: 'POST' };

    default:
      return null;
  }
}