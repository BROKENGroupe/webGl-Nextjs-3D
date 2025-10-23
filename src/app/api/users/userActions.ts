export interface RegisterAction {
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'GET';
}

export function resolveUserAction(action: string, payload: any): RegisterAction | null {
  switch (action) {
    case 'create-user':
      return { endpoint: '/account/register', method: 'POST' };
      
      case 'create-user-google':
        return { endpoint: '/users/createGoogle', method: 'POST' };

        case 'update-onboarding':
        return { endpoint: '/accounts/onboarding', method: 'POST' };

    default:
      return null;
  }
}