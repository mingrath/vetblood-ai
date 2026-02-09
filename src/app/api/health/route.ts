import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const hasToken = !!process.env.DATABASE_AUTH_TOKEN;

  try {
    // Test basic URL parsing first
    const testUrl = new URL(dbUrl || "https://example.com");

    // Now try libsql
    const { createClient } = await import("@libsql/client/http");
    const client = createClient({
      url: dbUrl || "https://example.com",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const result = await client.execute("SELECT COUNT(*) as count FROM Patient");
    client.close();

    return NextResponse.json({
      status: "ok",
      dbUrl: dbUrl ? dbUrl.substring(0, 50) + "..." : "NOT SET",
      hasToken,
      patientCount: result.rows[0]?.count,
      urlParsed: { protocol: testUrl.protocol, host: testUrl.host },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        status: "error",
        dbUrl: dbUrl ? `[${dbUrl.length} chars] ${dbUrl.substring(0, 50)}...` : "NOT SET",
        dbUrlFull: dbUrl,
        hasToken,
        error: err.message,
        name: err.name,
        stack: err.stack?.split("\n").slice(0, 10),
      },
      { status: 500 }
    );
  }
}
