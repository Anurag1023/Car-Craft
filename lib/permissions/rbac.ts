import { Role } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  role: Role;
  dealershipId?: string | null;
}

export function canAccessAdmin(user: AuthenticatedUser): boolean {
  return user.role === Role.ADMIN;
}

export function canAccessDealer(user: AuthenticatedUser): boolean {
  return user.role === Role.ADMIN || user.role === Role.DEALER;
}

export function canAccessServiceManager(user: AuthenticatedUser): boolean {
  return user.role === Role.ADMIN || user.role === Role.SERVICE_MANAGER;
}

export function canManageDealership(user: AuthenticatedUser, dealershipId: string): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.DEALER && user.dealershipId === dealershipId) return true;
  return false;
}

export function canManageServiceForDealership(user: AuthenticatedUser, dealershipId: string): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.SERVICE_MANAGER && user.dealershipId === dealershipId) return true;
  return false;
}

export function canEditVehicle(user: AuthenticatedUser, vehicleDealershipId: string): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.DEALER && user.dealershipId === vehicleDealershipId) return true;
  return false;
}

export function canCancelAppointment(user: AuthenticatedUser, customerId: string, dealershipId: string): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.id === customerId) return true;
  if (user.role === Role.SERVICE_MANAGER && user.dealershipId === dealershipId) return true;
  return false;
}

export function canViewOrder(user: AuthenticatedUser, orderCustomerId: string): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.id === orderCustomerId) return true;
  return false;
}
