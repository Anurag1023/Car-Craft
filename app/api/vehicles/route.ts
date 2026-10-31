import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { Role, FuelType, Transmission, BodyType, InventoryStatus } from "@prisma/client";
import { canEditVehicle } from "@/lib/permissions/rbac";

const vehicleSchema = z.object({
  dealershipId: z.string().uuid("Invalid dealership ID"),
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  price: z.number().positive("Price must be positive"),
  fuelType: z.nativeEnum(FuelType),
  transmission: z.nativeEnum(Transmission),
  bodyType: z.nativeEnum(BodyType),
  mileage: z.number().int().nonnegative(),
  engineCapacity: z.number().int().optional(),
  seatingCapacity: z.number().int().min(2).max(10).default(5),
  color: z.string().min(2, "Color is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  registrationNumber: z.string().optional(),
  inventoryStatus: z.nativeEnum(InventoryStatus).default(InventoryStatus.AVAILABLE),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().url("Valid image URL required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = vehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // RBAC: Check if dealer owns this dealership or is admin
    if (!canEditVehicle(session.user, data.dealershipId)) {
      return NextResponse.json(
        { error: "Forbidden: You can only add vehicles to your assigned dealership." },
        { status: 403 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        dealershipId: data.dealershipId,
        brand: data.brand,
        model: data.model,
        variant: data.variant,
        year: data.year,
        price: data.price,
        fuelType: data.fuelType,
        transmission: data.transmission,
        bodyType: data.bodyType,
        mileage: data.mileage,
        engineCapacity: data.engineCapacity,
        seatingCapacity: data.seatingCapacity,
        color: data.color,
        description: data.description,
        registrationNumber: data.registrationNumber,
        inventoryStatus: data.inventoryStatus,
        isFeatured: data.isFeatured,
        images: {
          create: [
            {
              url: data.imageUrl,
              isPrimary: true,
            },
          ],
        },
      },
      include: {
        dealership: true,
        images: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "VEHICLE_CREATED",
        entityType: "VEHICLE",
        entityId: vehicle.id,
        details: { brand: vehicle.brand, model: vehicle.model, price: vehicle.price },
      },
    });

    return NextResponse.json({
      success: true,
      vehicle,
      message: `${vehicle.brand} ${vehicle.model} added to inventory successfully!`,
    });
  } catch (error: any) {
    console.error("Vehicle creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create vehicle" }, { status: 500 });
  }
}
