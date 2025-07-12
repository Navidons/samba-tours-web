import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminSession } from "@/lib/server-auth";

export async function GET() {
  const session = validateAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const visitors = await prisma.visitor.findMany({
      orderBy: { lastVisitAt: "desc" },
      take: 100,
      select: {
        id: true,
        uniqueIdentifier: true,
        ipAddress: true,
        userAgent: true,
        deviceType: true,
        browser: true,
        operatingSystem: true,
        country: true,
        city: true,
        latitude: true,
        longitude: true,
        timezone: true,
        language: true,
        referrer: true,
        pageVisited: true,
        isMobile: true,
        firstVisitAt: true,
        lastVisitAt: true,
        totalVisits: true,
      },
    });
    return NextResponse.json({ visitors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch visitor logs" }, { status: 500 });
  }
} 