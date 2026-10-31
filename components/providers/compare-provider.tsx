"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./toast-provider";

export interface CompareVehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  price: number;
  year: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  mileage: number;
  engineCapacity?: number | null;
  seatingCapacity: number;
  image?: string;
}

interface CompareContextValue {
  compareList: CompareVehicle[];
  addToCompare: (vehicle: CompareVehicle) => void;
  removeFromCompare: (vehicleId: string) => void;
  clearCompare: () => void;
  isInCompare: (vehicleId: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<CompareVehicle[]>([]);
  const toast = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("carcraft_compare");
      if (saved) {
        setCompareList(JSON.parse(saved));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("carcraft_compare", JSON.stringify(compareList));
    } catch {
      // Ignore local storage error
    }
  }, [compareList]);

  const addToCompare = (vehicle: CompareVehicle) => {
    setCompareList((prev) => {
      if (prev.find((v) => v.id === vehicle.id)) {
        toast.info("Already in Comparison", `${vehicle.brand} ${vehicle.model} is already added`);
        return prev;
      }
      if (prev.length >= 3) {
        toast.error("Comparison Limit Reached", "You can compare up to 3 vehicles at a time");
        return prev;
      }
      toast.success("Added to Compare", `${vehicle.brand} ${vehicle.model} added to comparison`);
      return [...prev, vehicle];
    });
  };

  const removeFromCompare = (vehicleId: string) => {
    setCompareList((prev) => prev.filter((v) => v.id !== vehicleId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (vehicleId: string) => {
    return compareList.some((v) => v.id === vehicleId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}
