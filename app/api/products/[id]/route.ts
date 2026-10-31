import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { Role, ProductStatus } from "@prisma/client";

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

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(body.price !== undefined ? { price: parseFloat(body.price) } : {}),
        ...(body.discountPrice !== undefined ? { discountPrice: parseFloat(body.discountPrice) } : {}),
        ...(body.stockQuantity !== undefined ? { stockQuantity: parseInt(body.stockQuantity) } : {}),
        ...(body.status ? { status: body.status as ProductStatus } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
      message: `${updated.name} updated successfully!`,
    });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}
