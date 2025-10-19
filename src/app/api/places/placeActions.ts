export interface PlaceAction {
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'GET';
}

export function resolvePlaceAction(action: string, payload: any): PlaceAction | null {
  switch (action) {
    case 'create-place':
      return { endpoint: '/places/create', method: 'POST' };

    case 'update-place':
      return { endpoint: `/places/${payload.id}`, method: 'PUT' };

    case 'delete-place':
      return { endpoint: `/places/${payload.id}`, method: 'DELETE' };

    case 'get-places':
      return { endpoint: '/places/workspace/all', method: 'GET' };

    default:
      return null;
  }
}