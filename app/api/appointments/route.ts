import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { AppointmentStatus } from "@prisma/client";

const bookingSchema = z.object({
  dealershipId: z.string().uuid("Invalid dealership ID"),
  serviceCategoryId: z.string().uuid("Invalid service category ID"),
  vehicleBrand: z.string().min(2, "Vehicle brand is required"),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
  vehicleRegistration: z.string().min(5, "Vehicle registration number is required"),
  preferredDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Valid date required"),
  preferredTimeSlot: z.string().min(3, "Time slot is required"),
  additionalNotes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required to book a service appointment" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      dealershipId,
      serviceCategoryId,
      vehicleBrand,
      vehicleModel,
      vehicleRegistration,
      preferredDate,
      preferredTimeSlot,
      additionalNotes,
    } = parsed.data;

    const bookingDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Business rule: Prevent past dates
    if (bookingDate < today) {
      return NextResponse.json(
        { error: "Appointment date cannot be in the past" },
        { status: 400 }
      );
    }

    // Business rule: Check dealership exists & active
    const dealership = await prisma.dealership.findUnique({
      where: { id: dealershipId },
    });
    if (!dealership || dealership.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Selected dealership is currently unavailable for service bookings" },
        { status: 400 }
      );
    }

    // Business rule: Prevent duplicate customer booking for the same vehicle on the same date and slot
    const existing = await prisma.serviceAppointment.findFirst({
      where: {
        dealershipId,
        preferredDate: bookingDate,
        preferredTimeSlot,
        vehicleRegistration: vehicleRegistration.toUpperCase().trim(),
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A service booking already exists for this vehicle in the selected time slot. Please choose another slot.",
        },
        { status: 409 }
      );
    }

    // Check slot capacity (max 4 per slot)
    const slotCount = await prisma.serviceAppointment.count({
      where: {
        dealershipId,
        preferredDate: bookingDate,
        preferredTimeSlot,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    });

    if (slotCount >= 4) {
      return NextResponse.json(
        { error: "This time slot has reached maximum bay capacity. Please choose a different slot." },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appointmentNumber = `APT-${new Date().getFullYear()}-${randomSuffix}`;

    const appointment = await prisma.serviceAppointment.create({
      data: {
        appointmentNumber,
        customerId: session.user.id,
        dealershipId,
        serviceCategoryId,
        vehicleBrand,
        vehicleModel,
        vehicleRegistration: vehicleRegistration.toUpperCase().trim(),
        preferredDate: bookingDate,
        preferredTimeSlot,
        additionalNotes,
        status: AppointmentStatus.PENDING,
      },
      include: {
        dealership: true,
        serviceCategory: true,
      },
    });

    // Record activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "APPOINTMENT_BOOKED",
        entityType: "APPOINTMENT",
        entityId: appointment.id,
        details: {
          appointmentNumber: appointment.appointmentNumber,
          dealership: dealership.name,
          slot: preferredTimeSlot,
        },
      },
    });

    return NextResponse.json({
      success: true,
      appointmentNumber: appointment.appointmentNumber,
      message: `Appointment #${appointment.appointmentNumber} scheduled successfully at ${dealership.name}!`,
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule appointment" },
      { status: 500 }
    );
  }
}
