import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { Role } from "@prisma/client";

const dealershipSchema = z.object({
  name: z.string().min(2, "Dealership name required"),
  slug: z.string().min(2, "URL Slug required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  contactNumber: z.string().min(10, "Contact number is required"),
  email: z.string().email("Valid email required"),
  operatingHours: z.string().default("9:00 AM - 7:00 PM"),
  description: z.string().optional(),
  assignedDealerId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = dealershipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    const existingSlug = await prisma.dealership.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return NextResponse.json({ error: "A dealership with this slug already exists" }, { status: 409 });
    }

    const dealership = await prisma.dealership.create({
      data: {
        name: data.name,
        slug: data.slug,
        address: data.address,
        city: data.city,
        state: data.state,
        contactNumber: data.contactNumber,
        email: data.email,
        operatingHours: data.operatingHours,
        description: data.description,
        assignedDealerId: data.assignedDealerId,
      },
    });

    return NextResponse.json({
      success: true,
      dealership,
      message: `${dealership.name} registered successfully!`,
    });
  } catch (error: any) {
    console.error("Dealership creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create dealership" }, { status: 500 });
  }
}
