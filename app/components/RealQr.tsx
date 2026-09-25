"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function RealQr({ value, size = 220 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#16161F", light: "#00000000" },
      errorCorrectionLevel: "M",
    }).catch(() => {});
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="shrink-0 rounded-lg"
      aria-label="QR code du billet"
    />
  );
}
