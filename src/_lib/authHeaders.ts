export function AuthHeaders(session: any) {    
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken ?? ''}`,
        'x-workspace-id': session?.workspace?.id ?? '',
        'x-user-id': session?.id ?? '',
    };
}