import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, Crop, RotateCw, ZoomIn, ZoomOut, Check, X, Image as ImageIcon,
  Move, RefreshCw, Sparkles
} from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  initialImageUrl?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export default function ImageCropperModal({
  isOpen,
  initialImageUrl,
  aspectRatio = "16:9",
  onCropComplete,
  onClose
}: ImageCropperModalProps) {
  const [selectedRatio, setSelectedRatio] = useState<"16:9" | "4:3" | "1:1">(aspectRatio);
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageUrl || null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // degrees
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialImageUrl) {
        setImageSrc(initialImageUrl);
      }
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setSelectedRatio(aspectRatio);
    }
  }, [isOpen, initialImageUrl, aspectRatio]);

  // Load image object whenever source changes
  useEffect(() => {
    if (!imageSrc) {
      imageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw when transform parameters change
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define target dimensions based on aspect ratio
    let targetWidth = 800;
    let targetHeight = 450; // 16:9 default
    if (selectedRatio === "4:3") {
      targetWidth = 800;
      targetHeight = 600;
    } else if (selectedRatio === "1:1") {
      targetWidth = 600;
      targetHeight = 600;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    ctx.save();
    // Center transformations
    ctx.translate(targetWidth / 2 + pan.x, targetHeight / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate dimensions to cover canvas
    const imgAspect = img.width / img.height;
    const canvasAspect = targetWidth / targetHeight;

    let drawW: number;
    let drawH: number;

    if (imgAspect > canvasAspect) {
      drawH = targetHeight;
      drawW = targetHeight * imgAspect;
    } else {
      drawW = targetWidth;
      drawH = targetWidth / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [selectedRatio, zoom, rotation, pan]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    try {
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error("Failed to export cropped image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[#0b0b10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white text-left"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Crop size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Crop & Adjust Course Cover</h3>
                <p className="text-[11px] text-zinc-400">Reposition, zoom, and crop image for optimal catalog display</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Viewport Canvas or Empty Uploader */}
            {!imageSrc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-72 border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center group"
              >
                <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all text-white/50 mb-3">
                  <Upload size={28} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Click to browse or drop an image</h4>
                <p className="text-[11px] text-zinc-400 max-w-xs">Supports JPG, PNG, WEBP high-resolution banner artwork</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Crop Viewport with Grid Overlay */}
                <div
                  className="relative w-full h-72 bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <canvas
                    ref={canvasRef}
                    className="max-h-full max-w-full object-contain pointer-events-none shadow-2xl"
                  />

                  {/* Rule of thirds grid lines */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-white/10" />
                    <div className="border-r border-white/10" />
                    <div />
                  </div>

                  {/* Drag prompt badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white/70 flex items-center gap-1.5 pointer-events-none">
                    <Move size={10} />
                    <span>Drag to pan</span>
                  </div>
                </div>

                {/* Controls Bar: Ratio, Zoom, Rotate, Change Image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] items-center text-xs">
                  {/* Aspect Ratio Switcher */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Ratio:</span>
                    {(["16:9", "4:3", "1:1"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRatio(r)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          selectedRatio === r
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            : "bg-white/5 text-zinc-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {/* Zoom slider */}
                  <div className="flex items-center gap-2">
                    <ZoomOut size={12} className="text-zinc-400" />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                    />
                    <ZoomIn size={12} className="text-zinc-400" />
                    <span className="text-[10px] font-mono text-zinc-400 min-w-8">{zoom.toFixed(1)}x</span>
                  </div>

                  {/* Rotate and Replace button */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Rotate 90 degrees"
                    >
                      <RotateCw size={12} />
                      <span>Rotate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPan({ x: 0, y: 0 });
                        setZoom(1);
                        setRotation(0);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                      title="Reset Position"
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer text-[11px]"
                    >
                      Change
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={!imageSrc || isProcessing}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isProcessing ? "Processing Crop..." : "Apply & Save Crop"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
