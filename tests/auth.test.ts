import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import {
  canAccessAdmin,
  canAccessDealer,
  canAccessServiceManager,
  canManageDealership,
  canEditVehicle,
} from "@/lib/permissions/rbac";
import { Role } from "@prisma/client";

describe("Authentication & RBAC Logic", () => {
  it("should securely hash and verify passwords with bcrypt", async () => {
    const rawPassword = "Password123!";
    const hashed = await bcrypt.hash(rawPassword, 10);
    expect(hashed).not.toBe(rawPassword);

    const isMatch = await bcrypt.compare(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare("WrongPassword", hashed);
    expect(isWrongMatch).toBe(false);
  });

  it("should restrict admin routes strictly to ADMIN role", () => {
    const adminUser = { id: "u-1", role: Role.ADMIN };
    const dealerUser = { id: "u-2", role: Role.DEALER };
    const customerUser = { id: "u-3", role: Role.CUSTOMER };
    const serviceUser = { id: "u-4", role: Role.SERVICE_MANAGER };

    expect(canAccessAdmin(adminUser)).toBe(true);
    expect(canAccessAdmin(dealerUser)).toBe(false);
    expect(canAccessAdmin(customerUser)).toBe(false);
    expect(canAccessAdmin(serviceUser)).toBe(false);
  });

  it("should enforce dealership scoping for dealer users", () => {
    const mumbaiDealer = { id: "d-1", role: Role.DEALER, dealershipId: "mumbai-dealership-id" };
    const admin = { id: "a-1", role: Role.ADMIN };
    const bangaloreDealer = { id: "d-2", role: Role.DEALER, dealershipId: "bangalore-dealership-id" };

    // Mumbai dealer editing Mumbai vehicle: allowed
    expect(canEditVehicle(mumbaiDealer, "mumbai-dealership-id")).toBe(true);

    // Mumbai dealer editing Bangalore vehicle: forbidden
    expect(canEditVehicle(mumbaiDealer, "bangalore-dealership-id")).toBe(false);

    // Admin editing any vehicle: allowed
    expect(canEditVehicle(admin, "mumbai-dealership-id")).toBe(true);
    expect(canEditVehicle(admin, "bangalore-dealership-id")).toBe(true);
  });
});
