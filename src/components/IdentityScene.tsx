import { useEffect, useRef } from "react";

export function IdentityScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const element = canvasRef.current as HTMLCanvasElement | null;
    if (!element) return;
    const canvas = element as HTMLCanvasElement;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!context) return;
    const ctx = context;

    let frame = 0;
    let animation = 0;
    let width = 0;
    let height = 0;
    const nodes = Array.from({ length: 34 }, (_, index) => ({
      angle: (index / 34) * Math.PI * 2,
      radius: 0.18 + (index % 7) * 0.044,
      speed: 0.0012 + (index % 5) * 0.00038,
      size: 1.5 + (index % 4) * 0.7
    }));

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function roundedRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawCard(cx: number, cy: number, tick: number) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(tick * 0.002) * 0.045);
      
      const isMobile = width < 768;
      // Ensure the card doesn't shrink too much on mobile so the text fits
      const cardW = isMobile ? Math.min(320, width * 0.6) : Math.min(360, width * 0.32);
      const cardH = cardW * 0.58;
      
      roundedRect(-cardW / 2, -cardH / 2, cardW, cardH, cardW * 0.06);
      const gradient = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
      gradient.addColorStop(0, "rgba(255,255,255,0.22)");
      gradient.addColorStop(0.36, "rgba(111,255,233,0.16)");
      gradient.addColorStop(0.72, "rgba(248,198,109,0.18)");
      gradient.addColorStop(1, "rgba(255,122,182,0.12)");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Scale text and grid based on card size
      const scaleFactor = cardW / 360;
      
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.font = `600 ${18 * scaleFactor}px Inter, sans-serif`;
      ctx.fillText("tapyfi", -cardW / 2 + 28 * scaleFactor, -cardH / 2 + 44 * scaleFactor);
      
      ctx.font = `${12 * scaleFactor}px Inter, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("identity.link/live", -cardW / 2 + 28 * scaleFactor, -cardH / 2 + 68 * scaleFactor);

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          ctx.fillStyle = (row + col) % 2 === 0 ? "rgba(5,6,8,0.86)" : "rgba(111,255,233,0.8)";
          const dotSize = 9 * scaleFactor;
          const startX = cardW / 2 - (82 * scaleFactor) + col * (14 * scaleFactor);
          const startY = cardH / 2 - (74 * scaleFactor) + row * (14 * scaleFactor);
          ctx.fillRect(startX, startY, dotSize, dotSize);
        }
      }

      ctx.restore();
    }

    function draw() {
      frame += 1;
      const isMobile = width < 768;
      // On mobile, push the animation up so it doesn't overlap the text block at the bottom
      const cx = isMobile ? width * 0.5 : width * 0.58;
      const cy = isMobile ? height * 0.32 : height * 0.48;
      
      ctx.clearRect(0, 0, width, height);

      const backdrop = ctx.createLinearGradient(0, 0, width, height);
      backdrop.addColorStop(0, "#050608");
      backdrop.addColorStop(0.42, "#0c1417");
      backdrop.addColorStop(0.68, "#161008");
      backdrop.addColorStop(1, "#07080a");
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, width, height);

      ctx.globalAlpha = 0.24;
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      for (let x = -frame % 54; x < width; x += 54) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height * 0.16, height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const positions = nodes.map((node) => {
        const angle = node.angle + frame * node.speed;
        const rx = Math.min(width, height) * node.radius;
        // Tighter orbit on mobile
        const orbitMultiplier = isMobile ? 1.0 : 1.6;
        return {
          x: cx + Math.cos(angle) * rx * orbitMultiplier,
          y: cy + Math.sin(angle) * rx,
          size: node.size
        };
      });

      positions.forEach((point, index) => {
        const next = positions[(index + 5) % positions.length];
        ctx.strokeStyle = index % 3 === 0 ? "rgba(111,255,233,0.26)" : "rgba(248,198,109,0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
        ctx.fillStyle = index % 4 === 0 ? "#f8c66d" : "#6fffe9";
        ctx.globalAlpha = 0.58;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      drawCard(cx + Math.sin(frame * 0.01) * 10, cy, frame);

      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        const scanRadius = (isMobile ? 24 : 32) + i * (isMobile ? 20 : 28) + Math.sin(frame * 0.025 + i) * 4;
        ctx.arc(cx + (isMobile ? 0 : 210), cy - (isMobile ? 80 : 12), scanRadius, -0.7, 0.7);
        ctx.stroke();
      }
      ctx.restore();

      animation = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
