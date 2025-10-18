import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getSessionData() {
  const session = await getServerSession(authOptions);

  // Ahora tienes acceso a:
  // session.accessToken
  // session.user.id
  // session.workspace.id
  // ...y todo lo que mapeaste en mapTokenToSession

  return session;
}

export async function AuthHeadersWithSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("No session found");
  }
  console.log('AuthHeadersWithSession - Session:', session);
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
      'x-workspace-id': session.workspace.id ?? '',
      'x-user-id': session.user.id ?? '',
    },
  };
}