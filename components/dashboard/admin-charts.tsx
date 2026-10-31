"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface AdminChartsProps {
  fuelDistribution: { name: string; count: number }[];
  orderStatusDistribution: { name: string; count: number }[];
  revenueData: { month: string; revenue: number }[];
}

const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

export function AdminCharts({ fuelDistribution, orderStatusDistribution, revenueData }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trajectory Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">E-Commerce Order Revenue (₹)</h3>
          <p className="text-xs text-slate-500">Monthly accessories turnover</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(val: number) => [formatPrice(val), "Revenue"]}
                contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Fuel Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Inventory by Powertrain</h3>
          <p className="text-xs text-slate-500">Distribution across petrol, diesel, EV and hybrids</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fuelDistribution} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(val: number) => [`${val} Vehicles`, "Count"]}
                contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
