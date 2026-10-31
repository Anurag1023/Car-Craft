import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { InquiryStatus } from "@prisma/client";

const inquirySchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { vehicleId, name, email, phone, message } = parsed.data;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { dealership: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const inquiry = await prisma.vehicleInquiry.create({
      data: {
        vehicleId,
        customerId: session?.user?.id || null,
        name,
        email: email.toLowerCase().trim(),
        phone,
        message,
        status: InquiryStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Your inquiry has been submitted to ${vehicle.dealership.name}. A dealership advisor will reach out shortly.`,
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error("Inquiry submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit vehicle inquiry" },
      { status: 500 }
    );
  }
}
