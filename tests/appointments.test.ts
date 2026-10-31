import { describe, it, expect } from "vitest";
import { AppointmentStatus, Role } from "@prisma/client";
import { canCancelAppointment } from "@/lib/permissions/rbac";

describe("Service Appointment Booking & Scheduling Rules", () => {
  it("should reject appointments requested in the past", () => {
    const isDateValid = (dateStr: string) => {
      const target = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return target >= today;
    };

    const pastDate = "2020-01-01";
    expect(isDateValid(pastDate)).toBe(false);

    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    expect(isDateValid(futureDate)).toBe(true);
  });

  it("should detect duplicate time-slot conflict for the same vehicle", () => {
    const existingBookings = [
      {
        dealershipId: "dealer-1",
        date: "2026-11-05",
        slot: "10:30 - 12:00",
        vehicleReg: "MH 02 FJ 4812",
      },
    ];

    const isConflict = (dealershipId: string, date: string, slot: string, vehicleReg: string) => {
      return existingBookings.some(
        (b) =>
          b.dealershipId === dealershipId &&
          b.date === date &&
          b.slot === slot &&
          b.vehicleReg === vehicleReg
      );
    };

    // Conflicting attempt
    expect(isConflict("dealer-1", "2026-11-05", "10:30 - 12:00", "MH 02 FJ 4812")).toBe(true);

    // Different slot: no conflict
    expect(isConflict("dealer-1", "2026-11-05", "02:30 - 04:00", "MH 02 FJ 4812")).toBe(false);

    // Different car: no conflict
    expect(isConflict("dealer-1", "2026-11-05", "10:30 - 12:00", "KA 01 EK 4501")).toBe(false);
  });

  it("should enforce authorization rules for appointment cancellation", () => {
    const ownerCustomer = { id: "cust-1", role: Role.CUSTOMER };
    const otherCustomer = { id: "cust-2", role: Role.CUSTOMER };
    const serviceManager = { id: "sm-1", role: Role.SERVICE_MANAGER, dealershipId: "dealer-1" };
    const otherManager = { id: "sm-2", role: Role.SERVICE_MANAGER, dealershipId: "dealer-2" };
    const admin = { id: "admin-1", role: Role.ADMIN };

    // Owner can cancel own appointment
    expect(canCancelAppointment(ownerCustomer, "cust-1", "dealer-1")).toBe(true);

    // Other customer cannot cancel someone else's appointment
    expect(canCancelAppointment(otherCustomer, "cust-1", "dealer-1")).toBe(false);

    // Assigned service manager can cancel
    expect(canCancelAppointment(serviceManager, "cust-1", "dealer-1")).toBe(true);

    // Other dealership service manager cannot cancel
    expect(canCancelAppointment(otherManager, "cust-1", "dealer-1")).toBe(false);

    // Admin can cancel
    expect(canCancelAppointment(admin, "cust-1", "dealer-1")).toBe(true);
  });
});
