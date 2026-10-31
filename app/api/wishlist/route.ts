import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { customerId: session.user.id },
      include: {
        vehicle: {
          include: {
            dealership: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items: wishlistItems });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Failed to load wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await req.json();
    if (!vehicleId) {
      return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 });
    }

    const wishlistItem = await prisma.wishlistItem.upsert({
      where: {
        customerId_vehicleId: {
          customerId: session.user.id,
          vehicleId,
        },
      },
      update: {},
      create: {
        customerId: session.user.id,
        vehicleId,
      },
    });

    return NextResponse.json({ success: true, item: wishlistItem });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await req.json();
    if (!vehicleId) {
      return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 });
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        customerId: session.user.id,
        vehicleId,
      },
    });

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
