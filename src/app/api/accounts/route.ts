import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { resolveAccountAction } from "./accountActions";

export async function POST(req: NextRequest) {  

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'DELETE' ? JSON.stringify(payload) : undefined,
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.message || 'Error in account operation' },
        { status: res.status }
      );
    }

    // El backend devuelve la estructura que mostraste
    const data = await res.json();
    
    // Estructura esperada del backend:
    // {
    //   "id": "68e6d58bc90248623944d88e",
    //   "name": "Juan Pérez", 
    //   "email": "juan.perez@email.com",
    //   "image": { ... },
    //   "createdAt": "2025-10-08T21:04:52.784Z",
    //   "updatedAt": "2025-10-08T21:04:52.785Z",
    //   "accessToken": "eyJhbG...",
    //   "refreshToken": "eyJhbG..."
    // }

    // Opcional: Transformar la respuesta si es necesario
    const response = {
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        image: data.image,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }
    };

    return NextResponse.json(response, { status: method === 'POST' ? 201 : 200 });
    
  } catch (error: any) {
    console.error('Error en POST /api/accounts/register:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
