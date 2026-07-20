"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic, MicOff, Search, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildIntentUrl, fallbackSearchIntent, parseVoiceIntent } from "@/lib/voice-intents";
import { pickRecorderMimeType, transcribeAudioBlob } from "@/lib/transcribe-audio";
import { preloadSpeechVoices, speakText } from "@/lib/speech";

type Mode = "idle" | "recording" | "transcribing" | "manual";

const QUICK_PROMPTS = [
  "Find Mass near me",
  "Buscar Misa en Wichita",
  "Today's readings",
  "Lecturas de hoy",
  "Watch Mass online",
  "Misa en línea",
] as const;

export function VoiceSearchButton({ className }: { className?: string }) {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [canRecord, setCanRecord] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setCanRecord(
        typeof window !== "undefined" &&
          !!navigator.mediaDevices?.getUserMedia &&
          typeof MediaRecorder !== "undefined",
      );
      preloadSpeechVoices();
    });
  }, []);

  useEffect(() => {
    if (mode === "manual" && open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [mode, open]);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const navigateFromText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        toast.error("Say or type something first. / Di o escribe algo primero.");
        return;
      }

      const intent = parseVoiceIntent(trimmed) ?? fallbackSearchIntent(trimmed);
      // Find Mass: short cue now; full "I found… closest is…" after results load
      if (intent.href === "/find") {
        speakText(
          intent.locale === "es" ? "Buscando Misas." : "Looking for Mass.",
          intent.locale,
        );
      } else {
        speakText(intent.speak, intent.locale);
      }
      toast.success(intent.label);
      setOpen(false);
      setMode("idle");
      setStatus("");
      router.push(buildIntentUrl(intent));
    },
    [router],
  );

  const finishRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        resolve(new Blob(chunksRef.current, { type: mime }));
        chunksRef.current = [];
      };
      try {
        recorder.stop();
      } catch {
        resolve(new Blob());
      }
    });

    cleanupStream();
    setMode("transcribing");
    setStatus("Transcribing…");

    try {
      const text = await transcribeAudioBlob(blob, setStatus);
      if (!text) {
        toast.message("Couldn't catch that", {
          description: "Try again, or type your search below.",
        });
        setMode("manual");
        setStatus("");
        return;
      }
      setTranscript(text);
      navigateFromText(text);
    } catch (error) {
      console.error("Voice transcription error:", error);
      toast.error("Voice unavailable", {
        description:
          error instanceof Error
            ? error.message
            : "Type your search or tap a quick button — same results.",
        duration: 8000,
      });
      setMode("manual");
      setStatus("");
    }
  }, [cleanupStream, navigateFromText]);

  const startRecording = useCallback(async () => {
    if (!canRecord) {
      setMode("manual");
      setOpen(true);
      toast.message("Type your search", {
        description: "This browser can't record audio. Use the text box below.",
      });
      return;
    }

    setTranscript("");
    setStatus("Requesting microphone…");
    setMode("recording");
    setOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setStatus("Listening… tap Stop when you're done");
    } catch {
      cleanupStream();
      setMode("manual");
      setStatus("");
      toast.error("Microphone permission denied. Type your search below.");
    }
  }, [canRecord, cleanupStream]);

  const stopRecording = useCallback(() => {
    if (mode !== "recording") return;
    void finishRecording();
  }, [finishRecording, mode]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (mediaRecorderRef.current?.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      cleanupStream();
      setMode("idle");
      setStatus("");
    }
    setOpen(next);
  };

  const busy = mode === "recording" || mode === "transcribing";

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={className}
        aria-label="Search by voice or text"
        title="Search"
        disabled={mode === "transcribing"}
        onClick={() => {
          if (mode === "recording") {
            stopRecording();
            return;
          }
          // Open search UI first — typing always works; recording is optional
          setMode("manual");
          setOpen(true);
          setStatus("");
        }}
      >
        {mode === "recording" ? (
          <Square className="h-4 w-4" />
        ) : mode === "transcribing" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          aria-describedby="voice-transcript-desc"
          initialFocus={busy ? false : undefined}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "recording"
                ? "Listening…"
                : mode === "transcribing"
                  ? "Understanding…"
                  : "Search"}
            </DialogTitle>
            <DialogDescription id="voice-transcript-desc">
              English or Español. Speak, then Stop — we reply by voice and open the page.
              Type if you prefer. / Habla en inglés o español; respondemos en voz alta.
            </DialogDescription>
          </DialogHeader>

          {busy ? (
            <div
              className="min-h-24 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"
              aria-live="polite"
              role="status"
            >
              <p className="mb-2 flex items-center gap-2 font-medium text-primary">
                {mode === "transcribing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                )}
                {mode === "recording" ? "Recording" : "Working"}
              </p>
              {status ||
                (mode === "recording"
                  ? "Speak, then tap Stop"
                  : "Please wait…")}
              {transcript ? (
                <p className="mt-3 text-foreground">{transcript}</p>
              ) : null}
            </div>
          ) : (
            <>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigateFromText(transcript);
                }}
              >
                <Input
                  ref={inputRef}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Find Mass in Chicago"
                  aria-label="Search text"
                  autoFocus={mode === "manual"}
                />
                <Button type="submit">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => navigateFromText(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {mode === "recording" && (
              <Button onClick={stopRecording}>
                <Square className="mr-2 h-4 w-4" />
                Stop & search
              </Button>
            )}
            {canRecord && !busy && (
              <Button variant="secondary" onClick={() => void startRecording()}>
                <Mic className="mr-2 h-4 w-4" />
                Record again
              </Button>
            )}
            <Button
              variant="outline"
              disabled={mode === "transcribing"}
              onClick={() => handleOpenChange(false)}
            >
              <MicOff className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
