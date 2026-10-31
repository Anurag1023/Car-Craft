import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { Role, UserStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: "Security restriction: You cannot modify your own administrator permissions or status." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { role, status, dealershipId } = body;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role ? { role: role as Role } : {}),
        ...(status ? { status: status as UserStatus } : {}),
        ...(dealershipId !== undefined ? { dealershipId } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `User ${updated.name} updated successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
