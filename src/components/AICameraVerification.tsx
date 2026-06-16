"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Camera, ShieldAlert, Cpu, CheckCircle } from "lucide-react";

// Status message sequence for simulated/fallback validation
const fallbackStatusSteps = [
  "Initializing AI posture tracking model...",
  "User detected. Calibrating skeletal model...",
  "Scanning environment for activity objects...",
  "Analyzing movements and focus alignment...",
  "Action verified. Authenticating quest progress...",
];

export default function AICameraVerification() {
  const {
    cameraVerificationActive,
    cameraVerificationTaskName,
    cameraVerificationCallback,
    setCameraVerification,
  } = useAppStore();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState("Initializing camera...");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [targetCount, setTargetCount] = useState(5);
  const [activityType, setActivityType] = useState<"jumping_jacks" | "workout_reps" | "study_focus" | "hand_waves">("hand_waves");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Compute progress based on state
  const progress = targetCount > 0 ? Math.min(100, Math.round((repCount / targetCount) * 100)) : 0;

  // Determine the activity type and target count based on the task name
  useEffect(() => {
    if (!cameraVerificationActive) return;

    const name = (cameraVerificationTaskName || "").toLowerCase();
    
    // Defer state updates to avoid React's synchronous render warning
    const timer = setTimeout(() => {
      setRepCount(0);
      setVerified(false);

      if (name.includes("jumping") || name.includes("jack") || name.includes("jacks") || name.includes("high knees") || name.includes("burpees") || name.includes("mountain climbers")) {
        setActivityType("jumping_jacks");
        setTargetCount(10); // 10 reps
        setStatus(`Starting ${cameraVerificationTaskName || "HIIT"}: Do 10 reps`);
      } else if (name.includes("plank")) {
        setActivityType("study_focus");
        setTargetCount(10); // 10 seconds hold
        setStatus("Starting Plank: Hold plank position for 10s");
      } else if (
        name.includes("squat") ||
        name.includes("lunge") ||
        name.includes("push-up") ||
        name.includes("pushup") ||
        name.includes("dip") ||
        name.includes("bridge") ||
        name.includes("crunch") ||
        name.includes("raise") ||
        name.includes("twist")
      ) {
        setActivityType("workout_reps");
        setTargetCount(8); // 8 reps
        setStatus(`Starting ${cameraVerificationTaskName || "Exercise"}: Do 8 reps`);
      } else if (name.includes("workout") || name.includes("fitness") || name.includes("body") || name.includes("crusher")) {
        setActivityType("workout_reps");
        setTargetCount(8); // 8 reps
        setStatus("Starting Workout rep tracker: Do 8 reps");
      } else if (name.includes("study") || name.includes("focus") || name.includes("pomodoro") || name.includes("reader")) {
        setActivityType("study_focus");
        setTargetCount(5); // 5 steady focus points
        setStatus("Starting Focus tracker: Stay seated and quiet");
      } else {
        setActivityType("hand_waves");
        setTargetCount(5); // 5 hand waves
        setStatus("Action verification: Wave hand 5 times");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [cameraVerificationActive, cameraVerificationTaskName]);

  // Request camera permissions and start video
  useEffect(() => {
    if (!cameraVerificationActive) return;

    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: unknown) {
        console.error("Camera access failed", err);
        setError("Camera permission denied or device not found. Simulating offline validation...");
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraVerificationActive]);

  // Real-time Motion Detection and Activity Tracking Loop
  useEffect(() => {
    if (!cameraVerificationActive || !stream || error) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create an offscreen buffer canvas for low-res pixel processing
    const processWidth = 80;
    const processHeight = 60;
    const bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = processWidth;
    bufferCanvas.height = processHeight;
    const bufferCtx = bufferCanvas.getContext("2d");
    if (!bufferCtx) return;

    let prevLuminance: Uint8ClampedArray | null = null;
    let peakActive = false;
    let lastRepTime = 0;
    let localRepCount = 0;
    let localFocusCount = 0;
    let focusTicks = 0;

    const trackFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw video frame to output canvas (mirrored)
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw video frame to processed low-res buffer
        bufferCtx.drawImage(video, 0, 0, processWidth, processHeight);
        const frameData = bufferCtx.getImageData(0, 0, processWidth, processHeight);
        const pixels = frameData.data;

        // Calculate luminance map
        const luminance = new Uint8ClampedArray(processWidth * processHeight);
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          luminance[i / 4] = (r + g + b) / 3;
        }

        if (prevLuminance) {
          let motionPixelsCount = 0;
          let sumX = 0;
          let sumY = 0;

          // Perform frame differencing
          for (let i = 0; i < luminance.length; i++) {
            const diff = Math.abs(luminance[i] - prevLuminance[i]);
            if (diff > 25) {
              motionPixelsCount++;
              const px = i % processWidth;
              const py = Math.floor(i / processWidth);
              sumX += px;
              sumY += py;

              // Visual Overlay: draw motion feedback dots on the visible canvas
              const targetX = canvas.width - (px / processWidth) * canvas.width;
              const targetY = (py / processHeight) * canvas.height;
              ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
              ctx.fillRect(targetX - 2, targetY - 2, 4, 4);
            }
          }

          const motionRatio = motionPixelsCount / (processWidth * processHeight);

          if (motionPixelsCount > 20) {
            const centerX = canvas.width - (sumX / motionPixelsCount / processWidth) * canvas.width;
            const centerY = (sumY / motionPixelsCount / processHeight) * canvas.height;

            // Draw center of motion crosshair/indicator
            ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
            ctx.stroke();

            // Draw horizontal tracking line
            ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(canvas.width, centerY);
            ctx.stroke();

            // Track activity logic
            const now = Date.now();
            if (activityType === "jumping_jacks") {
              // High point of jumping jack (hands up, wider stance)
              if (motionRatio > 0.05 && centerY < canvas.height * 0.45) {
                peakActive = true;
              }
              // Return to low point (completed jumping jack)
              if (motionRatio > 0.05 && centerY > canvas.height * 0.55 && peakActive) {
                if (now - lastRepTime > 800) {
                  localRepCount += 1;
                  setRepCount(localRepCount);
                  peakActive = false;
                  lastRepTime = now;
                  
                  if (localRepCount >= targetCount) {
                    setVerified(true);
                    setStatus("Goal achieved! Verification successful.");
                  } else {
                    setStatus(`Jumping Jacks rep completed: ${localRepCount}/10`);
                  }
                }
              }
            } else if (activityType === "workout_reps") {
              // Workout reps (squats or pushup tracking based on vertical cycles)
              if (motionRatio > 0.04 && centerY < canvas.height * 0.45) {
                peakActive = true;
              }
              if (motionRatio > 0.04 && centerY > canvas.height * 0.55 && peakActive) {
                if (now - lastRepTime > 800) {
                  localRepCount += 1;
                  setRepCount(localRepCount);
                  peakActive = false;
                  lastRepTime = now;

                  if (localRepCount >= targetCount) {
                    setVerified(true);
                    setStatus("Goal achieved! Verification successful.");
                  } else {
                    setStatus(`Workout rep completed: ${localRepCount}/8`);
                  }
                }
              }
            } else if (activityType === "hand_waves") {
              // Hand waves detection (rapid side-to-side bursts)
              if (motionRatio > 0.08) {
                if (now - lastRepTime > 900) {
                  localRepCount += 1;
                  setRepCount(localRepCount);
                  lastRepTime = now;

                  if (localRepCount >= targetCount) {
                    setVerified(true);
                    setStatus("Goal achieved! Verification successful.");
                  } else {
                    setStatus(`Hand wave registered: ${localRepCount}/5`);
                  }
                }
              }
            }
          }

          // Study Focus tracking: user must sit relatively still
          if (activityType === "study_focus") {
            focusTicks++;
            if (focusTicks % 10 === 0) { // check every 1 second
              if (motionRatio < 0.02) {
                localFocusCount += 1;
                setRepCount(localFocusCount);
                if (localFocusCount >= targetCount) {
                  setVerified(true);
                  setStatus("Goal achieved! Verification successful.");
                } else {
                  setStatus(`Focused posture maintained: ${localFocusCount}/5s`);
                }
              } else if (motionRatio > 0.08) {
                setStatus("Wild movement detected. Please sit quietly to focus!");
              }
            }
          }
        }

        prevLuminance = luminance;
      }

      animationFrameRef.current = requestAnimationFrame(trackFrame);
    };

    animationFrameRef.current = requestAnimationFrame(trackFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraVerificationActive, stream, error, activityType, targetCount]);

  // Handle callback triggers and modal closing
  useEffect(() => {
    if (verified) {
      const finishTimeout = setTimeout(() => {
        if (cameraVerificationCallback) {
          cameraVerificationCallback();
        }
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setCameraVerification(false, "", null);
      }, 2000);

      return () => clearTimeout(finishTimeout);
    }
  }, [verified, cameraVerificationCallback, stream, setCameraVerification]);

  // Simulation mode trigger
  const startSimulation = () => {
    setError(null);
    let currentRep = 0;
    setStatus(`Simulating ${activityType.replace("_", " ")} activity...`);

    const interval = setInterval(() => {
      currentRep += 1;
      setRepCount(currentRep);
      setStatus(`Simulating rep: ${currentRep}/${targetCount}`);

      if (currentRep >= targetCount) {
        clearInterval(interval);
        setVerified(true);
        setStatus("Goal achieved! Verification successful.");
      }
    }, 800);
  };

  if (!cameraVerificationActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden glass-strong border border-white/10 flex flex-col relative"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-2">
              <Cpu className="text-purple-400 animate-spin-slow" size={18} />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                AI Motion Verification
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={startSimulation}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-extrabold uppercase tracking-wider"
              >
                [Simulate]
              </button>
              <button
                onClick={() => {
                  if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                  }
                  setCameraVerification(false, "", null);
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">
                Task: {cameraVerificationTaskName || "Quest Action"}
              </h3>
              <p className="text-[11px] text-purple-300 font-semibold tracking-wide">
                Target: {targetCount} {activityType === "study_focus" ? "Seconds of Focus" : activityType.replace("_", " ")}
              </p>
            </div>

            {/* Video / Canvas viewport box */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner flex items-center justify-center">
              {/* Hidden raw video element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ display: "none" }}
              />

              {error ? (
                <div className="p-6 text-center space-y-3">
                  <ShieldAlert className="mx-auto text-yellow-500" size={32} />
                  <p className="text-xs text-yellow-200/90 font-medium">{error}</p>
                  <button
                    onClick={startSimulation}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 text-purple-300 text-xs rounded-xl font-bold transition-all"
                  >
                    Simulate Verification
                  </button>
                </div>
              ) : stream ? (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="text-gray-600 animate-pulse" size={32} />
                  <span className="text-xs text-gray-500">Connecting webcam feed...</span>
                </div>
              )}

              {/* Scanning lines */}
              {!verified && !error && stream && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* Neon laser line */}
                  <motion.div
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] opacity-80"
                  />
                  {/* Grid mask overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.3))] bg-[linear-gradient(rgba(18,24,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
                </div>
              )}

              {/* Rep tracker visual HUD */}
              {!verified && stream && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-left">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {activityType.replace("_", " ")}
                  </div>
                  <div className="text-sm font-black text-white">
                    {repCount} / {targetCount} Done
                  </div>
                </div>
              )}

              {/* Verified success overlay with green tick */}
              {verified && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 15 }}
                  >
                    <CheckCircle className="text-emerald-400" size={56} />
                  </motion.div>
                  <span className="text-sm font-black text-emerald-300 tracking-widest">
                    ACTIVITY VERIFIED ✓
                  </span>
                </motion.div>
              )}
            </div>

            {/* Analysis details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 truncate max-w-[80%] font-medium">
                  {status}
                </span>
                <span className="font-bold text-gradient-gold shrink-0">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Custom styled progress bar */}
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    verified
                      ? "bg-gradient-to-r from-emerald-500 to-green-400"
                      : "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 animate-shimmer"
                  }`}
                  style={{
                    boxShadow: verified
                      ? "0 0 12px rgba(16,185,129,0.5)"
                      : "0 0 12px rgba(139,92,246,0.3)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
