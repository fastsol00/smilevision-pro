import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CameraCaptureButtonProps {
  buttonLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  facingMode?: "user" | "environment";
  onCapture: (imageDataUrl: string) => void;
  onFallback?: () => void;
  buttonVariant?: ButtonProps["variant"];
  className?: string;
}

export function CameraCaptureButton({
  buttonLabel,
  dialogTitle,
  dialogDescription,
  facingMode = "user",
  onCapture,
  onFallback,
  buttonVariant = "outline",
  className,
}: CameraCaptureButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  useEffect(() => {
    if (!open) stopStream();
  }, [open, stopStream]);

  // Callback ref: attach stream the moment the <video> mounts
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
    const stream = streamRef.current;
    if (el && stream) {
      el.srcObject = stream;
      el.onloadedmetadata = () => {
        void el.play().then(() => setReady(true)).catch(() => {
          toast.error("Impossibile avviare l'anteprima della fotocamera.");
        });
      };
    }
  }, []);

  const handleOpenCamera = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("La fotocamera non è disponibile su questo dispositivo.");
      onFallback?.();
      return;
    }
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setOpen(true);
      // If the video element is already mounted (e.g. retry), bind now
      const el = videoElRef.current;
      if (el) {
        el.srcObject = stream;
        el.onloadedmetadata = () => {
          void el.play().then(() => setReady(true)).catch(() => {});
        };
      }
    } catch {
      toast.error("Non sono riuscito ad aprire la fotocamera. Puoi caricare una foto dal dispositivo.");
      onFallback?.();
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = () => {
    const video = videoElRef.current;
    if (!video || !video.videoWidth) {
      toast.error("Anteprima non ancora pronta, attendi un istante.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Impossibile acquisire la foto.");
      return;
    }
    // Flip horizontally to match the (un-mirrored) preview the user sees
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setOpen(false);
    onCapture(dataUrl);
  };

  return (
    <>
      <Button type="button" variant={buttonVariant} className={className} onClick={handleOpenCamera} disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" /> : <Camera />}
        {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black md:aspect-auto">
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                style={{ transform: "scaleX(-1)" }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {!ready && (
                <div className="absolute inset-0 grid place-items-center text-white/80">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </div>
              )}

              {/* Mobile: floating capture bar on top of the video so it's always reachable */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-10 md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full border-white/40 bg-white/10 px-4 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Annulla
                </Button>
                <Button
                  type="button"
                  className="h-12 rounded-full px-6 text-[14px] font-semibold"
                  onClick={handleCapture}
                  disabled={!ready}
                >
                  <Camera /> Scatta foto
                </Button>
              </div>
            </div>

            <div className="hidden flex-col p-6 md:flex md:p-8">
              <DialogHeader className="text-left">
                <DialogTitle className="font-display text-[26px] font-semibold text-foreground">
                  {dialogTitle}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {dialogDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" className="h-11 rounded-full px-6" onClick={handleCapture} disabled={!ready}>
                  <Camera /> Scatta foto
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-full px-5" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
