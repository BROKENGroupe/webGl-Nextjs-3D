export function AuthHeaders(session: any) {
    console.log('Generating Auth Headers with session:', session);
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken ?? ''}`,
        'x-workspace-id': session?.workspace?.id ?? '',
        'x-user-id': session?.id ?? '',
    };
}