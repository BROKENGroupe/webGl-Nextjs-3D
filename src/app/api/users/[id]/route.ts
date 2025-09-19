import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest, response: any) {
  const token = await getToken({ req });

  const id = response.params.id;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Falta userId en query" }, { status: 400 });
  }

  try {
    const data = await fetch(`${process.env.API_BASE_URL}/users/all`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });
    // const safeData = JSON.parse(JSON.stringify(data));
    // return NextResponse.json(safeData);


    const dataResponse = await data.json();
    const transformed = { ...dataResponse, source: 'proxied-through-nextjs' };

    return new Response(JSON.stringify(transformed), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
