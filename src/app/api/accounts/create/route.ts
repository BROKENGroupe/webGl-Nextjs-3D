import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { resolveAccountAction } from "../accountActions";
import { AuthHeaders } from "@/_lib/authHeaders";
import { Session } from "inspector/promises";

// POST /api/tasks
export async function POST(req: NextRequest) {
  //const token = await getToken({ req });

  // if (!token) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const user = {
    id: userId,
  }
  
  console.log('User ID from headers:', userId);
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const accountAction = resolveAccountAction(action, payload);

    if (!accountAction) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { endpoint, method } = accountAction;

    const res = await fetch(`${process.env.API_BASE_URL}${endpoint}`, {
      method,
      headers: AuthHeaders(user),
      body: method !== 'DELETE' ? JSON.stringify(payload) : undefined,
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.message || 'Error in task operation' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: method === 'POST' ? 201 : 200 });
  } catch (error: any) {
    console.error('Error en POST /api/tasks:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
