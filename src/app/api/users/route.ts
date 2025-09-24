
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/users/all`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || 'Error fetching projects' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error en /api/projects:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}