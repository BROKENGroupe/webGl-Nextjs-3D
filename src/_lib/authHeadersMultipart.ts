import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function AuthHeadersMultipart() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("No session found");
  }
  
  return {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'x-workspace-id': session.workspace.id ?? '',
      'x-user-id': session.user.id ?? '',
    },
  };
}