import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerAuthSession } from "@/lib/auth/session";
import { AppointmentStatus, Role } from "@prisma/client";

const updateSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  serviceNotes: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.serviceAppointment.findUnique({
      where: { id: params.id },
      include: { dealership: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Role check: Admin, Service Manager of this dealership, or Customer cancelling their own pending appointment
    const isServiceManager =
      session.user.role === Role.SERVICE_MANAGER &&
      session.user.dealershipId === appointment.dealershipId;
    const isAdmin = session.user.role === Role.ADMIN;
    const isCustomer = session.user.id === appointment.customerId;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { status, serviceNotes } = parsed.data;

    // Customer can only cancel their own pending/confirmed appointment
    if (isCustomer && !isAdmin && !isServiceManager) {
      if (status !== AppointmentStatus.CANCELLED) {
        return NextResponse.json({ error: "Customers can only cancel their appointment" }, { status: 403 });
      }
    } else if (!isAdmin && !isServiceManager) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updated = await prisma.serviceAppointment.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(serviceNotes !== undefined ? { serviceNotes } : {}),
        ...(isServiceManager ? { serviceManagerId: session.user.id } : {}),
      },
      include: {
        dealership: true,
        serviceCategory: true,
      },
    });

    // Log event
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `APPOINTMENT_${status || "UPDATED"}`,
        entityType: "APPOINTMENT",
        entityId: appointment.id,
        details: { status, appointmentNumber: appointment.appointmentNumber },
      },
    });

    return NextResponse.json({
      success: true,
      appointment: updated,
      message: `Appointment #${updated.appointmentNumber} status updated to ${updated.status}`,
    });
  } catch (error: any) {
    console.error("Appointment update error:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
