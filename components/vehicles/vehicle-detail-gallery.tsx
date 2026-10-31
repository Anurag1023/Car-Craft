"use client";

import { useState } from "react";

interface GalleryProps {
  images: { id: string; url: string; isPrimary: boolean }[];
  title: string;
}

export function VehicleDetailGallery({ images, title }: GalleryProps) {
  const defaultImage =
    images.find((img) => img.isPrimary)?.url ||
    images[0]?.url ||
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80";

  const [activeImage, setActiveImage] = useState(defaultImage);

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="h-96 md:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md relative">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img.url)}
              className={`h-20 w-28 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                activeImage === img.url
                  ? "border-blue-600 shadow-md ring-2 ring-blue-600/30"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
