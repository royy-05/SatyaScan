import React, { useState } from "react";
import { Button } from "./Button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Sun } from "lucide-react";
import { cn } from "../../lib/utils";

export function ForensicImageInspector({ src, alt = "Document Scan", className, regions = [] }) {
  const [scale, setScale] = useState(1);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setContrast(100);
    setBrightness(100);
  };

  const toggleHighContrast = () => {
    if (contrast === 100) {
      setContrast(160);
      setBrightness(110);
    } else {
      setContrast(100);
      setBrightness(100);
    }
  };

  const handleImageLoad = (e) => {
    setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  return (
    <div className={cn("border border-[#71807A]/30 rounded-md bg-[#283733] overflow-hidden flex flex-col shadow-sm", className)}>
      {/* Toolbar */}
      <div className="bg-[#283733] border-b border-[#475853] px-3 py-2 flex items-center justify-between text-[#FDF6F0]">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
          <span>Forensic Inspector</span>
          <span className="text-[10px] font-mono text-[#DBCEB1]">({(scale * 100).toFixed(0)}%)</span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleHighContrast}
            title="Toggle High Contrast ELA Mode"
            className={cn("h-7 px-2 text-xs text-[#FDF6F0] hover:bg-[#475853]", contrast > 100 && "bg-[#DBCEB1] text-[#283733] font-bold")}
          >
            <Sun className="h-3.5 w-3.5 mr-1" /> Contrast
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="h-7 w-7 p-0 text-[#FDF6F0] hover:bg-[#475853]"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            title="Zoom In"
            className="h-7 w-7 p-0 text-[#FDF6F0] hover:bg-[#475853]"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            title="Reset View"
            className="h-7 w-7 p-0 text-[#FDF6F0] hover:bg-[#475853]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative flex-1 bg-black/40 min-h-[260px] max-h-[420px] overflow-auto flex items-center justify-center p-4">
        <div
          className="relative max-h-full flex items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 0.2s ease-out",
          }}
        >
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            style={{
              filter: `contrast(${contrast}%) brightness(${brightness}%)`,
              transition: "filter 0.2s ease-out",
            }}
            className="max-h-full object-contain rounded select-none cursor-grab active:cursor-grabbing"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x250/283733/DBCEB1?text=Document+Scan+Unavailable";
            }}
          />
          
          {/* Forensic Bounding Box Overlay */}
          {naturalSize.w > 0 && regions && regions.length > 0 && (
            <svg
              viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ objectFit: "contain" }}
            >
              {regions.map((r, i) => (
                <rect
                  key={i}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="#ef4444"
                  strokeWidth={Math.max(2, naturalSize.w * 0.003)}
                  strokeDasharray={`${Math.max(4, naturalSize.w * 0.005)},${Math.max(4, naturalSize.w * 0.005)}`}
                />
              ))}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
