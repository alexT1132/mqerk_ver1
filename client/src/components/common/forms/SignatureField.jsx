import { useEffect, useRef, useState } from "react";

// Simple signature field: switch between typing a name and drawing on a canvas.
// Props:
// - value: string (typed name)
// - onChange: (val: string) => void
// - onImageChange: (file: File|null) => void  // called with PNG file when drawing ends
// - placeholder?: string
// - className?: string
export default function SignatureField({
  value,
  onChange,
  onImageChange,
  placeholder = "Nombre completo",
  className = "",
}) {
  const [mode, setMode] = useState("text"); // 'text' | 'draw'
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef([]); // for stroke smoothing
  const [hasStroke, setHasStroke] = useState(false);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = canvas.clientWidth || 600;
    const cssH = canvas.clientHeight || 160;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#111827"; // gray-900
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);
    ctxRef.current = ctx;
    setHasStroke(false);
  };

  useEffect(() => {
    if (mode !== "draw") return;
    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mode]);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    return { x, y };
  };

  const startDraw = (e) => {
    if (mode !== "draw") return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    pointsRef.current = [{ x, y }];
    setHasStroke(true);
    e.preventDefault();
  };
  const draw = (e) => {
    if (mode !== "draw" || !drawingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getCanvasPos(e);
    const pts = pointsRef.current;
    pts.push({ x, y });

    // Smooth stroke using quadratic Bezier between midpoints
    if (pts.length >= 3) {
      const p1 = pts[pts.length - 3];
      const p2 = pts[pts.length - 2];
      const p3 = pts[pts.length - 1];
      const mid1x = (p1.x + p2.x) / 2;
      const mid1y = (p1.y + p2.y) / 2;
      const mid2x = (p2.x + p3.x) / 2;
      const mid2y = (p2.y + p3.y) / 2;

      ctx.beginPath();
      ctx.moveTo(mid1x, mid1y);
      ctx.quadraticCurveTo(p2.x, p2.y, mid2x, mid2y);
      ctx.stroke();
    } else {
      // first segment
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    e.preventDefault();
  };
  const normalizeSignature = async (srcCanvas) => {
    // Extract image data
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const ctx = srcCanvas.getContext("2d");
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    // Find bounding box of INK (dark) pixels using luminance threshold
    let minX = w, minY = h, maxX = -1, maxY = -1;
    let count = 0;
    let sumX = 0, sumY = 0, sumXX = 0, sumYY = 0, sumXY = 0; // for PCA orientation
    const lumThreshold = 230; // lower = darker
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (lum < lumThreshold) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
          // accumulate for PCA
          count++;
          sumX += x; sumY += y; sumXX += x * x; sumYY += y * y; sumXY += x * y;
        }
      }
    }
    if (maxX < 0 || maxY < 0) {
      // nothing drawn
      return null;
    }
    // Add padding around bounding box
    const pad = Math.floor(Math.max((maxX - minX), (maxY - minY)) * 0.06);
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    // Create cropped canvas
    const crop = document.createElement("canvas");
    crop.width = cropW; crop.height = cropH;
    const cctx = crop.getContext("2d");
    cctx.putImageData(img, -minX, -minY);

    // Deskew using PCA orientation (rotate so the main axis is horizontal)
    // Compute orientation angle theta
    let theta = 0;
    if (count > 0) {
      const meanX = sumX / count;
      const meanY = sumY / count;
      const covXX = sumXX / count - meanX * meanX;
      const covYY = sumYY / count - meanY * meanY;
      const covXY = sumXY / count - meanX * meanY;
      theta = 0.5 * Math.atan2(2 * covXY, covXX - covYY); // radians
    }
    const deg = (theta * 180) / Math.PI;
    let rotated = crop;
    if (Math.abs(deg) > 3) {
      const cos = Math.cos(-theta);
      const sin = Math.sin(-theta);
      const newW = Math.ceil(Math.abs(cropW * cos) + Math.abs(cropH * sin));
      const newH = Math.ceil(Math.abs(cropW * sin) + Math.abs(cropH * cos));
      const rot = document.createElement("canvas");
      rot.width = newW; rot.height = newH;
      const rctx = rot.getContext("2d");
      rctx.fillStyle = "#ffffff";
      rctx.fillRect(0, 0, newW, newH);
      rctx.translate(newW / 2, newH / 2);
      rctx.rotate(-theta);
      rctx.drawImage(crop, -cropW / 2, -cropH / 2);
      rotated = rot;

      // Trim again to remove excess white after rotation
      const rimg = rctx.getImageData(0, 0, newW, newH);
      const rd = rimg.data;
      let rminX = newW, rminY = newH, rmaxX = -1, rmaxY = -1;
      for (let y = 0; y < newH; y++) {
        for (let x = 0; x < newW; x++) {
          const i = (y * newW + x) * 4;
          const rLum = 0.2126 * rd[i] + 0.7152 * rd[i + 1] + 0.0722 * rd[i + 2];
          if (rLum < lumThreshold) {
            if (x < rminX) rminX = x;
            if (y < rminY) rminY = y;
            if (x > rmaxX) rmaxX = x;
            if (y > rmaxY) rmaxY = y;
          }
        }
      }
      if (rmaxX >= 0 && rmaxY >= 0) {
        const rw = rmaxX - rminX + 1;
        const rh = rmaxY - rminY + 1;
        const trimmed = document.createElement("canvas");
        trimmed.width = rw; trimmed.height = rh;
        trimmed.getContext("2d").putImageData(rimg, -rminX, -rminY);
        rotated = trimmed;
      }
    }

    // Normalize into high-res target (supersampling for smoother result)
    const baseW = 600, baseH = 180;
    const scaleUp = 2; // 2x supersampling
    const targetW = baseW * scaleUp;
    const targetH = baseH * scaleUp;
    const targetHi = document.createElement("canvas");
    targetHi.width = targetW; targetHi.height = targetH;
    const thctx = targetHi.getContext("2d");
    thctx.fillStyle = "#ffffff";
    thctx.fillRect(0, 0, targetW, targetH);

    // Fit crop within target while preserving aspect ratio
    const rW = rotated.width, rH = rotated.height;
    const scale = Math.min((targetW * 0.9) / rW, (targetH * 0.8) / rH);
    const drawW = Math.max(1, Math.round(rW * scale));
    const drawH = Math.max(1, Math.round(rH * scale));
    const dx = Math.floor((targetW - drawW) / 2);
    const dy = Math.floor((targetH - drawH) / 2);

    // Slight blur to remove jitter, then draw grayscale
    thctx.filter = "blur(0.3px)";
    thctx.drawImage(rotated, dx, dy, drawW, drawH);
    thctx.filter = "none";

    // Binarize to pure black/white
    const out = thctx.getImageData(0, 0, targetW, targetH);
    const d = out.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      const isInk = lum < 220;
      d[i] = d[i + 1] = d[i + 2] = isInk ? 0 : 255;
      d[i + 3] = 255;
    }
    thctx.putImageData(out, 0, 0);

    // Simple 3x3 majority filter to smooth edges
    try {
      const id = thctx.getImageData(0, 0, targetW, targetH);
      const px = id.data;
      const copy = new Uint8ClampedArray(px); // copy
      const idx = (x, y) => (y * targetW + x) * 4;
      for (let y = 1; y < targetH - 1; y++) {
        for (let x = 1; x < targetW - 1; x++) {
          // count black neighbors
          let blacks = 0;
          for (let j = -1; j <= 1; j++) {
            for (let i2 = -1; i2 <= 1; i2++) {
              if (copy[idx(x + i2, y + j)] === 0) blacks++;
            }
          }
          const k = idx(x, y);
          const isBlack = blacks >= 5; // majority
          px[k] = px[k + 1] = px[k + 2] = isBlack ? 0 : 255;
        }
      }
      thctx.putImageData(id, 0, 0);
    } catch {}

    // Downscale to final size
    const target = document.createElement("canvas");
    target.width = baseW; target.height = baseH;
    const tctx = target.getContext("2d");
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(targetHi, 0, 0, baseW, baseH);

    // Export PNG file
    const file = await new Promise((resolve) => {
      target.toBlob((blob) => {
        if (!blob) return resolve(null);
        resolve(new File([blob], "firma_normalizada.png", { type: "image/png" }));
      }, "image/png");
    });
    return file;
  };

  const [previewUrl, setPreviewUrl] = useState("");

  const endDraw = async () => {
    if (mode !== "draw") return;
    drawingRef.current = false;
    // export PNG only if there is content
    if (!canvasRef.current || !hasStroke) {
      onImageChange?.(null);
      return;
    }
    try {
      // Normalize the drawn signature for a cleaner, consistent look
      const file = await normalizeSignature(canvasRef.current);
      onImageChange?.(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(file ? URL.createObjectURL(file) : "");
    } catch {
      onImageChange?.(null);
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    const w = canvasRef.current.clientWidth || 600;
    const h = canvasRef.current.clientHeight || 160;
    ctxRef.current.clearRect(0, 0, w, h);
    ctxRef.current.fillStyle = "#ffffff";
    ctxRef.current.fillRect(0, 0, w, h);
    setHasStroke(false);
    pointsRef.current = [];
    onImageChange?.(null);
  };

  return (
    <div className={"w-full " + className}>
      <div className="flex justify-center gap-2 text-sm mb-2">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`px-3 py-1 rounded-full border ${mode === "text" ? "bg-purple-100 border-purple-400 text-purple-700" : "border-gray-300 text-gray-700"}`}
        >
          Escribir nombre
        </button>
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={`px-3 py-1 rounded-full border ${mode === "draw" ? "bg-purple-100 border-purple-400 text-purple-700" : "border-gray-300 text-gray-700"}`}
        >
          Dibujar firma
        </button>
      </div>

      {mode === "text" ? (
        <div className="flex items-center justify-center w-full">
          <div className="border-2 rounded-2xl p-2 w-full md:w-2/3 lg:w-1/2">
            <input
              type="text"
              placeholder={placeholder}
              value={value || ""}
              onChange={(e) => onChange?.(e.target.value)}
              className="outline-none text-sm w-full"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-full md:w-2/3 lg:w-1/2">
            <div className="border-2 rounded-2xl bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-40 touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
          </div>
          {previewUrl && (
            <div className="w-full md:w-2/3 lg:w-1/2">
              <p className="text-xs text-gray-500 mb-1">Vista previa normalizada (se subirá esta versión):</p>
              <img src={previewUrl} alt="Firma normalizada" className="w-full border rounded" />
            </div>
          )}
          <div className="flex gap-2 text-sm">
            <button type="button" onClick={clearCanvas} className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50">Limpiar</button>
          </div>
        </div>
      )}
    </div>
  );
}
