import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

export function useTypedSession() {
  const { data, status } = useSession();
  const user = data?.user as any | undefined;
  const workspace = data?.workspace as any | undefined;
  return { user, status, session: data, workspace };
}