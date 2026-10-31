import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { canEditVehicle } from "@/lib/permissions/rbac";
import { InventoryStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        dealership: true,
        images: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (!canEditVehicle(session.user, vehicle.dealershipId)) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify vehicles from another dealership." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updated = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        ...(body.price ? { price: parseFloat(body.price) } : {}),
        ...(body.inventoryStatus ? { inventoryStatus: body.inventoryStatus as InventoryStatus } : {}),
        ...(body.isFeatured !== undefined ? { isFeatured: Boolean(body.isFeatured) } : {}),
        ...(body.mileage ? { mileage: parseInt(body.mileage) } : {}),
        ...(body.description ? { description: body.description } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      vehicle: updated,
      message: "Vehicle updated successfully",
    });
  } catch (error: any) {
    console.error("Vehicle update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (!canEditVehicle(session.user, vehicle.dealershipId)) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete vehicles from another dealership." },
        { status: 403 }
      );
    }

    await prisma.vehicle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Vehicle removed from inventory",
    });
  } catch (error: any) {
    console.error("Vehicle delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete vehicle" }, { status: 500 });
  }
}
