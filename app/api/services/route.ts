import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { services } from "@/db/schema";

// GET /api/services — public: bookable services list
export async function GET() {
  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      durationMinutes: services.durationMinutes,
      price: services.price,
    })
    .from(services)
    .where(eq(services.isActive, true));

  return NextResponse.json({ data: rows });
}
