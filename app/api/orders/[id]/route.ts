import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { Role, OrderStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderStatus } = body;

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        orderStatus: orderStatus as OrderStatus,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `ORDER_STATUS_${orderStatus}`,
        entityType: "ORDER",
        entityId: updated.id,
        details: { orderNumber: updated.orderNumber, status: orderStatus },
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order #${updated.orderNumber} status changed to ${orderStatus}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
