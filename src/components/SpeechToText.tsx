"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Live Waveform Visualization ─────────────────────────────
// Uses AudioContext + AnalyserNode to read frequency data from
// the mic stream, computes RMS amplitude, and paints scrolling
// bars on a HiDPI canvas via requestAnimationFrame.

function LiveWaveform({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    // HiDPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    // Bar layout
    const barWidth = 2;
    const barGap = 2.5;
    const barStep = barWidth + barGap;
    const numBars = Math.floor(w / barStep);
    const minBarH = 2;

    // Ring buffer — newest amplitude at writeHead, scrolls right-to-left
    const history = new Float32Array(numBars);
    let writeHead = 0;
    let lastPush = 0;
    const pushInterval = 50; // ~20 samples/sec

    const startTime = performance.now();

    const draw = (now: number) => {
      analyser.getByteFrequencyData(freqData);

      // RMS amplitude across all frequency bins
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) {
        const v = freqData[i] / 255;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / freqData.length);

      if (now - lastPush >= pushInterval) {
        history[writeHead % numBars] = rms;
        writeHead++;
        lastPush = now;
      }

      ctx.clearRect(0, 0, w, h);
      const midY = h / 2;
      const maxAmp = h * 0.38;
      const elapsed = now - startTime;
      const fadeIn = Math.min(elapsed / 300, 1);

      // Draw bars from right (newest) to left (oldest)
      for (let i = 0; i < numBars; i++) {
        const idx = ((writeHead - 1 - i) % numBars + numBars) % numBars;
        const amp = history[idx];
        const barH = Math.max(minBarH, amp * maxAmp);
        const x = w - i * barStep - barWidth;
        if (x < 0) break;

        const distFade = 1 - (i / numBars) * 0.6;
        ctx.globalAlpha = fadeIn * distFade * 0.7;
        ctx.fillStyle = "#1a1a1a";

        const radius = barWidth / 2;
        const top = midY - barH;
        const barFullH = barH * 2;

        ctx.beginPath();
        ctx.roundRect(x, top, barWidth, barFullH, radius);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      audioCtx.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-label="Recording audio"
      role="status"
    />
  );
}

// ─── Hook ────────────────────────────────────────────────────

interface UseSpeechToTextReturn {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
  clearError: () => void;
  micStream: MediaStream | null;
}

export function useSpeechToText(
  onTranscript?: (text: string) => void
): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // Ref keeps callback fresh without re-creating start/stop functions
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setMicStream(null);
    setIsListening(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      cancelledRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicStream(stream);

      // Pick best available codec
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const wasCancelled = cancelledRef.current;
        const chunks = [...chunksRef.current];
        cleanupStream();

        if (wasCancelled || chunks.length === 0) return;

        // Transcribe via server-side Deepgram proxy
        setIsProcessing(true);
        try {
          const blob = new Blob(chunks, { type: mimeType });
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const { text } = await res.json();
            if (text?.trim() && onTranscriptRef.current) {
              onTranscriptRef.current(text.trim());
            }
          }
        } catch (err) {
          console.error("Transcription failed:", err);
        } finally {
          setIsProcessing(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start(250); // collect 250ms chunks
      setIsListening(true);
    } catch (err) {
      cleanupStream();
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow mic access in your browser settings.");
      } else {
        setError("Could not start recording. Check your microphone.");
      }
    }
  }, [cleanupStream]);

  const stopListening = useCallback(() => {
    cancelledRef.current = false;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const cancelListening = useCallback(() => {
    cancelledRef.current = true;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      cleanupStream();
    }
  }, [cleanupStream]);

  // Cleanup on unmount
  useEffect(() => cleanupStream, [cleanupStream]);

  return {
    isListening,
    isProcessing,
    error,
    startListening,
    stopListening,
    cancelListening,
    clearError,
    micStream,
  };
}

// ─── Listening Bar UI ────────────────────────────────────────
// Designed to render INSIDE the same input container, replacing
// the text input + icon row with cancel | waveform | send arrow.

interface VoiceListeningBarProps {
  micStream: MediaStream | null;
  onStop: () => void;
  onCancel: () => void;
}

export function VoiceListeningBar({
  micStream,
  onStop,
  onCancel,
}: VoiceListeningBarProps) {
  return (
    <div className="flex items-center gap-2 animate-fade-in">
      {/* Cancel (X) */}
      <button
        onClick={onCancel}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-container hover:bg-neutral-container-emphasis transition-colors duration-150 shrink-0 text-text-muted"
        title="Cancel"
        aria-label="Cancel recording"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1 1l8 8M9 1L1 9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Waveform — fills the center like text would */}
      <div className="flex-1 h-10 overflow-hidden">
        <LiveWaveform stream={micStream} />
      </div>

      {/* Stop & Send — same send arrow button, black */}
      <button
        onClick={onStop}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-fill text-white hover:bg-neutral-fill-emphasis transition-colors duration-150 shrink-0"
        title="Stop and send"
        aria-label="Stop recording and send"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 12V4M8 4l-3.5 3.5M8 4l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
