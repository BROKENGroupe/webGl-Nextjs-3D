import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { resolvePlaceAction } from "./placeActions";
import { AuthHeadersWithSession } from "@/_lib/authHeaders";
import { AuthHeadersMultipart } from "@/_lib/authHeadersMultipart";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Recibe el FormData
    const formData = await req.formData();
    const action = 'create-place';
    // El resto de los campos están en formData, puedes pasarlos como payload
    // O si necesitas un objeto plano:
    // const payload = formDataToObject(formData);

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const placeAction = resolvePlaceAction(action, formData);

    if (!placeAction) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { endpoint, method } = placeAction;
    const rawHeaders = await AuthHeadersMultipart();

    const res = await fetch(`${process.env.API_BASE_URL}${endpoint}`, {
      method,
      headers: rawHeaders.headers,
      body: formData,
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

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const action = 'get-places';

    const placeAction = resolvePlaceAction(action, {});

    if (!placeAction) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { endpoint, method } = placeAction;
    const rawHeaders = await AuthHeadersWithSession();
    const res = await fetch(`${process.env.API_BASE_URL}${endpoint}`, {
      method: method,
      headers: rawHeaders.headers,
    });

    const data = await res.json();
    console.log('API /api/places GET data:', data);

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('API /api/places GET error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
