"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type CamState = "idle" | "requesting" | "scanning" | "denied" | "error";

export function CameraScanner({
  onDecode,
}: {
  onDecode: (text: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const onDecodeRef = useRef(onDecode);
  const startRef = useRef<() => void>(() => {});
  const [state, setState] = useState<CamState>("idle");

  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    function stop() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || doneRef.current) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(frame.data, frame.width, frame.height, {
            inversionAttempts: "dontInvert",
          });
          if (code && code.data) {
            doneRef.current = true;
            stop();
            onDecodeRef.current(code.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    async function start() {
      setState("requesting");
      doneRef.current = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setState("scanning");
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        setState(
          name === "NotAllowedError" || name === "SecurityError"
            ? "denied"
            : "error",
        );
      }
    }

    startRef.current = start;
    return stop;
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-[30px] bg-ink-4">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${state === "scanning" ? "opacity-100" : "opacity-0"}`}
        />
        <canvas ref={canvasRef} className="hidden" />
        {state === "requesting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px] text-muted">
              Demande d&apos;accès à la caméra…
            </span>
          </div>
        )}
        <span className="pointer-events-none absolute top-0 left-0 h-14 w-14 rounded-tl-[30px] border-t-4 border-l-4 border-accent" />
        <span className="pointer-events-none absolute top-0 right-0 h-14 w-14 rounded-tr-[30px] border-t-4 border-r-4 border-accent" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-14 w-14 rounded-bl-[30px] border-b-4 border-l-4 border-accent" />
        <span className="pointer-events-none absolute right-0 bottom-0 h-14 w-14 rounded-br-[30px] border-r-4 border-b-4 border-accent" />
      </div>

      {state === "idle" && (
        <button
          type="button"
          onClick={() => startRef.current()}
          className="flex h-12 items-center gap-2 rounded-xl bg-accent px-5 text-[14.5px] font-bold text-white"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7h3l2-3h8l2 3h3v13H3z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Activer la caméra
        </button>
      )}

      {state === "scanning" && (
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="font-display text-xl font-bold tracking-tight">
            Vise le QR code
          </div>
          <div className="max-w-[260px] text-[13.5px] leading-relaxed text-muted">
            Le scan est automatique.
          </div>
        </div>
      )}

      {state === "denied" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="max-w-[260px] text-[13.5px] leading-relaxed text-bad">
            Accès à la caméra refusé. Autorise la caméra dans les réglages
            de ton navigateur pour ce site, puis réessaie.
          </div>
          <button
            type="button"
            onClick={() => startRef.current()}
            className="h-11 rounded-xl border border-line-2 bg-ink-3 px-4 text-[13.5px] font-semibold"
          >
            Réessayer
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="max-w-[260px] text-center text-[13.5px] leading-relaxed text-muted">
          Caméra indisponible sur cet appareil ou ce navigateur. Utilise la
          simulation ci-dessous.
        </div>
      )}
    </div>
  );
}
