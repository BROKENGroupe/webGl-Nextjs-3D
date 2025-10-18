import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { resolvePlaceAction } from "./placeActions";
import { AuthHeadersWithSession } from "@/_lib/authHeaders";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const placeAction = resolvePlaceAction(action, payload);

    if (!placeAction) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { endpoint, method } = placeAction;

    const rawHeaders = await AuthHeadersWithSession();  
    
    const res = await fetch(`${process.env.API_BASE_URL}${endpoint}`, {
      method,
      headers: rawHeaders.headers,
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
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
