import { useEffect, useMemo, useRef } from "react";

/**
 * Lightweight particles background using Canvas.
 * - No deps; performant on mobile and desktop.
 * - Connects nearby particles with subtle lines.
 */
export default function ParticlesBackground({
  className = "",
  color = "255,255,255", // rgb without alpha
  maxSpeed = 0.45,
  linkDistance = 120,
  density = 16000, // lower = more particles; used as px^2 per particle
  minCount = 60,
  minCountMobile = 36,
  fpsCap = undefined,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const pointerRef = useRef({ x: null, y: null });

  const prefersReducedMotion = useMemo(() =>
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  []);

  // Agrupa props en un solo objeto para que el tamaño del array de dependencias sea constante
  const settings = useMemo(() => ({
    color,
    density,
    linkDistance,
    maxSpeed,
    minCount,
    minCountMobile,
    fpsCap,
    prefersReducedMotion,
  }), [color, density, linkDistance, maxSpeed, minCount, minCountMobile, fpsCap, prefersReducedMotion]);

  useEffect(() => {
  const { color, density, linkDistance, maxSpeed, minCount, minCountMobile, fpsCap, prefersReducedMotion } = settings;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
  let lastDraw = 0;
  // 0 or negative means uncapped; undefined defaults applied in resize()
  let effectiveFpsCap = fpsCap ?? 0;
    let isSmall = false;

    // Spatial grid reused across frames to avoid allocations
    let grid = [];
    let cols = 0, rows = 0, cellSize = 0;
    function ensureGrid(maxDist) {
      const newCellSize = maxDist;
      const newCols = Math.max(1, Math.ceil(width / newCellSize));
      const newRows = Math.max(1, Math.ceil(height / newCellSize));
      const total = newCols * newRows;
      if (newCols !== cols || newRows !== rows || newCellSize !== cellSize || grid.length !== total) {
        cols = newCols; rows = newRows; cellSize = newCellSize;
        grid = new Array(total);
        for (let i = 0; i < total; i++) grid[i] = [];
      } else {
        for (let i = 0; i < grid.length; i++) grid[i].length = 0;
      }
    }

    function resize() {
  const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.floor(rect?.width || window.innerWidth);
      height = Math.floor(rect?.height || window.innerHeight);
      // Mobile-friendly DPR cap and FPS cap
  isSmall = width <= 520 || (navigator.deviceMemory && navigator.deviceMemory <= 3);
      dpr = isSmall ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  // In small devices cap ~30fps by default; on desktop keep uncapped unless fpsCap provided
  effectiveFpsCap = isSmall ? Math.min(30, (fpsCap ?? 30)) : (fpsCap ?? 0);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Slightly reduce density on small/low-memory devices
      const densityBoost = isSmall ? 1.5 : 1;
      const minTarget = (isSmall ? minCountMobile : minCount);
      const targetCount = Math.max(minTarget, Math.floor((width * height) / (density * densityBoost)));
      // adjust particles count
      if (particles.length > targetCount) {
        particles.length = targetCount;
      } else {
        while (particles.length < targetCount) {
          particles.push(newParticle());
        }
      }
    }

    function newParticle() {
      const speed = prefersReducedMotion ? 0 : (Math.random() * 0.7 + 0.3) * maxSpeed;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 1.6 + 0.6,
      };
    }

    function update(ts) {
      // FPS cap to reduce load on mobile devices
      if (effectiveFpsCap > 0) {
        const frameInterval = 1000 / effectiveFpsCap;
        if (ts - lastDraw < frameInterval) {
          rafRef.current = requestAnimationFrame(update);
          return;
        }
        lastDraw = ts;
      }
      ctx.clearRect(0, 0, width, height);
      // draw connections first for depth effect
      drawConnections();
      // draw particles
      ctx.fillStyle = `rgba(${color},0.9)`;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        // wrap around edges for continuous flow
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(update);
    }

    function drawConnections() {
      const maxDist = isSmall ? Math.max(90, linkDistance * 0.85) : linkDistance;
      ensureGrid(maxDist);

      // bin particles into reusable grid
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.min(cols - 1, Math.max(0, (p.x / cellSize) | 0));
        const cy = Math.min(rows - 1, Math.max(0, (p.y / cellSize) | 0));
        grid[cx + cy * cols].push(i);
      }

      ctx.lineWidth = 1.1;
      const maxDist2 = maxDist * maxDist;
      const invMaxDist = 1 / maxDist;
      // iterate bins and neighbors only
      for (let cyi = 0; cyi < rows; cyi++) {
        for (let cxi = 0; cxi < cols; cxi++) {
          const cellIndex = cxi + cyi * cols;
          const list = grid[cellIndex];
          if (!list || list.length === 0) continue;

          for (let idx = 0; idx < list.length; idx++) {
            const i = list[idx];
            const p1 = particles[i];
            for (let ny = -1; ny <= 1; ny++) {
              for (let nx = -1; nx <= 1; nx++) {
                const ncx = cxi + nx;
                const ncy = cyi + ny;
                if (ncx < 0 || ncy < 0 || ncx >= cols || ncy >= rows) continue;
                const nList = grid[ncx + ncy * cols];
                if (!nList) continue;
                for (let jdx = 0; jdx < nList.length; jdx++) {
                  const j = nList[jdx];
                  if (j <= i) continue; // avoid duplicates
                  const p2 = particles[j];
                  const dx = p1.x - p2.x;
                  const dy = p1.y - p2.y;
                  const dist2 = dx * dx + dy * dy;
                  if (dist2 > maxDist2) continue;
                  const alpha = 0.42 * (1 - Math.sqrt(dist2) * invMaxDist);
                  ctx.strokeStyle = `rgba(${color},${alpha.toFixed(3)})`;
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      // pointer attraction highlight
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      if (px == null || py == null) return;
      const pcx = Math.min(cols - 1, Math.max(0, (px / cellSize) | 0));
      const pcy = Math.min(rows - 1, Math.max(0, (py / cellSize) | 0));
      let linesDrawn = 0;
      const maxPointerLines = isSmall ? 18 : 28;
      const maxD = Math.max(maxDist * 1.35, 140);
      const maxD2 = maxD * maxD;
      const invMaxD = 1 / maxD;
      for (let ny = -1; ny <= 1; ny++) {
        for (let nx = -1; nx <= 1; nx++) {
          const ncx = pcx + nx;
          const ncy = pcy + ny;
          if (ncx < 0 || ncy < 0 || ncx >= cols || ncy >= rows) continue;
          const nList = grid[ncx + ncy * cols];
          if (!nList) continue;
          for (let j = 0; j < nList.length; j++) {
            const p = particles[nList[j]];
            const dx = p.x - px;
            const dy = p.y - py;
            const d2 = dx * dx + dy * dy;
            if (d2 > maxD2) continue;
            const a = 0.55 * (1 - Math.sqrt(d2) * invMaxD);
            ctx.strokeStyle = `rgba(${color},${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(px, py);
            ctx.stroke();
            linesDrawn++;
            if (linesDrawn >= maxPointerLines) return;
          }
        }
      }
    }

    function handlePointer(e) {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    }
    function handleLeave() {
      pointerRef.current.x = null;
      pointerRef.current.y = null;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerdown", handlePointer, { passive: true });
    window.addEventListener("pointerleave", handleLeave);
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(update);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    rafRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerdown", handlePointer);
  window.removeEventListener("pointerleave", handleLeave);
  document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [settings]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
