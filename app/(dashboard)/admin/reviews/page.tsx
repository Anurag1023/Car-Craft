import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { Star, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireRole([Role.ADMIN]);

  const reviews = await prisma.review.findMany({
    include: {
      customer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Reviews & Ratings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited feedback submitted for dealerships, accessories, and completed services ({reviews.length} reviews)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{r.customer.name}</p>
                <p className="text-[11px] text-slate-400">{r.customer.email}</p>
              </div>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < r.rating ? "fill-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic leading-relaxed">
              &ldquo;{r.reviewText}&rdquo;
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
              <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                {r.targetType}
              </Badge>
              <span>{formatDateTime(r.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
