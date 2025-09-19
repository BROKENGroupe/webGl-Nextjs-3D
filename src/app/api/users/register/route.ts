import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserAction } from "../userActions";

// POST /api/tasks
export async function POST(req: NextRequest) {
  //const token = await getToken({ req });

  // if (!token) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const taskAction = resolveUserAction(action, payload);

    if (!taskAction) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { endpoint, method } = taskAction;

    const res = await fetch(`${process.env.API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
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
