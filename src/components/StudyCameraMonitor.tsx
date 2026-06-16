"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ShieldAlert, Cpu, Eye, EyeOff, AlertTriangle, UserCheck, RefreshCw, Moon, Zap, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface StudyCameraMonitorProps {
  isActive: boolean;
  timerRunning: boolean;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onUpdateStats?: (stats: {
    focusScore: number;
    distractions: number;
    sleepIncidents: number;
    timeAway: number;
    blinks: number;
  }) => void;
}

// Helper to dynamically load external scripts with a promise
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// 2D distance helper
function dist(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Calculate Eye Aspect Ratio (EAR)
function calculateEAR(landmarks: any[], indices: number[]) {
  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];

  const dVertical1 = dist(p2, p6);
  const dVertical2 = dist(p3, p5);
  const dHorizontal = dist(p1, p4);

  if (dHorizontal === 0) return 0;
  return (dVertical1 + dVertical2) / (2.0 * dHorizontal);
}

// Calculate Variance of position coordinate history
function calculateVariance(values: number[]) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
}

export default function StudyCameraMonitor({
  isActive,
  timerRunning,
  onPauseTimer,
  onResumeTimer,
  onUpdateStats,
}: StudyCameraMonitorProps) {
  const { pomodoroMode } = useAppStore();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Initializing Focus Monitor...");
  const [modelLoading, setModelLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Focus Metrics
  const [focusScore, setFocusScore] = useState(100);
  const [presenceScore, setPresenceScore] = useState(100);
  const [attentionScore, setAttentionScore] = useState(100);
  const [postureScore, setPostureScore] = useState(100);
  const [blinkCount, setBlinkCount] = useState(0);

  // Posture Calibration Baseline
  const [baselineY, setBaselineY] = useState<number | null>(null);

  // Cumulative Session Stats
  const [distractions, setDistractions] = useState(0);
  const [sleepIncidents, setSleepIncidents] = useState(0);
  const [timeAway, setTimeAway] = useState(0);
  const [totalFocusedSecs, setTotalFocusedSecs] = useState(0);

  // Alerts array
  const [alerts, setAlerts] = useState<string[]>([]);
  const [focusHistory, setFocusHistory] = useState<number[]>(new Array(30).fill(100));

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keep mutable ref of the callback to prevent infinite re-renders
  const onUpdateStatsRef = useRef(onUpdateStats);
  useEffect(() => {
    onUpdateStatsRef.current = onUpdateStats;
  }, [onUpdateStats]);

  const onPauseTimerRef = useRef(onPauseTimer);
  useEffect(() => {
    onPauseTimerRef.current = onPauseTimer;
  }, [onPauseTimer]);

  const onResumeTimerRef = useRef(onResumeTimer);
  useEffect(() => {
    onResumeTimerRef.current = onResumeTimer;
  }, [onResumeTimer]);

  // Emit stats back to parent screen only when values change
  useEffect(() => {
    if (onUpdateStatsRef.current) {
      onUpdateStatsRef.current({
        focusScore,
        distractions,
        sleepIncidents,
        timeAway,
        blinks: blinkCount,
      });
    }
  }, [focusScore, distractions, sleepIncidents, timeAway, blinkCount]);

  // Aggregate overall focus score
  useEffect(() => {
    // Focus score = 50% Presence + 30% Attention + 20% Posture
    const composite = Math.round(
      (presenceScore * 0.5) + (attentionScore * 0.3) + (postureScore * 0.2)
    );
    setFocusScore(composite);
  }, [presenceScore, attentionScore, postureScore]);

  // Record total active study time in seconds
  useEffect(() => {
    if (timerRunning && presenceScore > 50 && attentionScore > 50) {
      const interval = setInterval(() => {
        setTotalFocusedSecs((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerRunning, presenceScore, attentionScore]);

  // Maintain focus score history graph (updates every 3 seconds)
  useEffect(() => {
    if (timerRunning) {
      const interval = setInterval(() => {
        setFocusHistory((prev) => {
          const next = [...prev, focusScore];
          if (next.length > 30) next.shift();
          return next;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [timerRunning, focusScore]);

  // Request camera permissions and start video stream
  useEffect(() => {
    if (!isActive || pomodoroMode !== "work") {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

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
        console.error("Study camera access failed", err);
        setError("Camera permission denied.");
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, pomodoroMode]);

  // Auto-pause timer if camera stream gets blocked
  useEffect(() => {
    if (!isActive || !error || !timerRunning) return;

    let countdown = 5;
    setStatus(`Camera blocked. Pausing in ${countdown}s...`);

    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        onPauseTimerRef.current();
        setStatus("Camera access required to study.");
      } else {
        setStatus(`Camera blocked. Pausing in ${countdown}s...`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, error, timerRunning]);

  // Initialize and run MediaPipe FaceMesh loop
  useEffect(() => {
    if (!isActive || pomodoroMode !== "work" || !stream || error) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let active = true;
    let faceMeshInstance: any = null;

    // Trackers for delays
    let absentTicks = 0;
    let sleepTicks = 0;
    let distractedTicks = 0;

    let lastBlinkState = false;
    let blinkCooldown = 0;
    let lastBlinkTime = performance.now();

    // Baseline calibration variables
    let calibrationFrames = 0;
    let accumulatedY = 0;

    // Head position history for anti-cheat
    const positionHistory: number[] = [];

    async function initMediaPipe() {
      try {
        // Load MediaPipe scripts from CDN
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");

        if (!active) return;

        // Wait up to 3 seconds for FaceMesh global to be compiled by browser
        let retries = 30;
        while (!(window as any).FaceMesh && retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries--;
        }

        const FaceMesh = (window as any).FaceMesh;
        if (!FaceMesh) {
          throw new Error("FaceMesh global class not found after script loading.");
        }

        faceMeshInstance = new FaceMesh({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMeshInstance.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });

        // FaceMesh processing results callback
        faceMeshInstance.onResults((results: any) => {
          if (!active) return;
          setModelLoading(false);

          const currentCanvas = canvasRef.current;
          if (!currentCanvas) return;
          const ctx = currentCanvas.getContext("2d");
          if (!ctx) return;

          // Clear canvas overlay
          ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);

          const currentAlerts: string[] = [];

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];

            // 1. Draw glowing purple holographic face grid points
            ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
            ctx.shadowBlur = 4;
            ctx.shadowColor = "#a855f7";

            // Draw selection of key landmark dots
            const keyLandmarks = [
              4, 10, 152, 234, 454, 33, 133, 362, 263, 13, 14, 0,
              159, 145, 386, 374, 468, 473, 297, 67, 105, 334
            ];
            for (const idx of keyLandmarks) {
              const pt = landmarks[idx];
              if (pt) {
                const x = pt.x * currentCanvas.width;
                const y = pt.y * currentCanvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
                ctx.fill();
              }
            }
            ctx.shadowBlur = 0; // reset shadow

            // Presence is confirmed
            setPresenceScore(100);
            absentTicks = 0;

            // 2. Eye Aspect Ratio (EAR) - Sleep & Blink detection
            // Indices: outer, top, top-mid, inner, bottom-mid, bottom
            const leftEAR = calculateEAR(landmarks, [33, 159, 158, 133, 153, 145]);
            const rightEAR = calculateEAR(landmarks, [263, 386, 387, 362, 373, 374]);
            const avgEAR = (leftEAR + rightEAR) / 2;

            // Blink calculation
            const now = performance.now();
            if (avgEAR < 0.165) {
              if (!lastBlinkState && blinkCooldown <= 0) {
                lastBlinkState = true;
                setBlinkCount((prev) => prev + 1);
                blinkCooldown = 5; // frame cooldown
                lastBlinkTime = now;
              }
            } else if (avgEAR > 0.21) {
              lastBlinkState = false;
            }
            if (blinkCooldown > 0) blinkCooldown--;

            // Sleep check (Closed eyes for extended frames)
            const eyesClosed = avgEAR < 0.165;
            if (eyesClosed) {
              currentAlerts.push("💤 EYES CLOSED");
            }

            // 3. Head Orientation (Looking Away)
            const nose = landmarks[4];
            const leftFaceBorder = landmarks[234];
            const rightFaceBorder = landmarks[454];
            const forehead = landmarks[10];
            const chin = landmarks[152];

            const yawRatio = (nose.x - leftFaceBorder.x) / (rightFaceBorder.x - leftFaceBorder.x);
            const pitchRatio = (nose.y - forehead.y) / (chin.y - forehead.y);

            const isLookingAway = yawRatio < 0.35 || yawRatio > 0.65 || pitchRatio < 0.38 || pitchRatio > 0.62;
            if (isLookingAway && !eyesClosed) {
              currentAlerts.push("👁️ LOOKING AWAY");
            }

            // 4. Posture check (Drooping/Slouching)
            const headCenterY = (nose.y + chin.y) / 2;

            // Calibrate on startup
            if (baselineY === null) {
              if (calibrationFrames < 25) {
                accumulatedY += headCenterY;
                calibrationFrames++;
                setStatus(`Calibrating posture... (${Math.round((calibrationFrames / 25) * 100)}%)`);
              } else {
                const finalBaseline = accumulatedY / 25;
                setBaselineY(finalBaseline);
                setStatus("Focus Monitor Active.");
              }
            }

            let postureQuality = 100;
            if (baselineY !== null) {
              const diffY = headCenterY - baselineY;
              // Sinking down significantly in the frame indicates slouching/drooping
              if (diffY > 0.07) {
                const slouchPercent = Math.min(1, (diffY - 0.07) / 0.15);
                postureQuality = Math.round(100 - slouchPercent * 60);
                currentAlerts.push("📐 POOR POSTURE / SLOUCHING");
              }
            }
            setPostureScore(postureQuality);

            // 5. Anti-Cheat (Static Photo / Static Video feed detection)
            positionHistory.push(nose.x);
            if (positionHistory.length > 80) positionHistory.shift();

            let isStaticCheat = false;
            if (positionHistory.length >= 40) {
              const variance = calculateVariance(positionHistory);
              // A real person has sub-pixel noise and breathing movements. Standard deviation = 0 indicates fake feed.
              if (variance < 0.00001) {
                isStaticCheat = true;
                currentAlerts.push("🚫 FAKE WEB-FEED DETECTED");
              }
            }

            // Require at least 1 blink every 22 seconds
            const secondsSinceLastBlink = (now - lastBlinkTime) / 1000;
            if (secondsSinceLastBlink > 22 && !eyesClosed) {
              isStaticCheat = true;
              currentAlerts.push("🚫 NO BLINKING (ANTI-CHEAT)");
            }

            // Update attention level
            let attention = 100;
            if (eyesClosed) attention = 0;
            else if (isLookingAway) attention = 30;
            else if (isStaticCheat) attention = 0;
            setAttentionScore(attention);

            // TIMER RULE MANAGEMENT
            if (timerRunning) {
              // Rule 1: Sleep detection (paused after 20 seconds / ~40 processed frames)
              if (eyesClosed) {
                sleepTicks++;
                if (sleepTicks > 40) {
                  setSleepIncidents((prev) => prev + 1);
                  setStatus("Study session paused. Sleeping detected.");
                  onPauseTimerRef.current();
                } else {
                  setStatus(`Extreme stillness/sleep alert... (${Math.max(1, Math.ceil((40 - sleepTicks) / 2))}s)`);
                }
              } else {
                sleepTicks = 0;
              }

              // Rule 2: Distraction / Looking away (paused after 30 seconds / ~60 processed frames)
              if (isLookingAway || isStaticCheat) {
                distractedTicks++;
                if (distractedTicks > 60) {
                  setDistractions((prev) => prev + 1);
                  setStatus(isStaticCheat ? "Cheat warning. Timer paused." : "Study session paused. Distraction detected.");
                  onPauseTimerRef.current();
                } else {
                  setStatus(`Looking away alert... (${Math.max(1, Math.ceil((60 - distractedTicks) / 2))}s)`);
                }
              } else {
                distractedTicks = 0;
              }
            } else {
              // Auto resume conditions: User present, eyes open, looking straight, and no cheat alert
              const isCleanFocus = !eyesClosed && !isLookingAway && !isStaticCheat;
              if (isCleanFocus && baselineY !== null) {
                sleepTicks = 0;
                distractedTicks = 0;
                absentTicks = 0;
                setStatus("Focus restored! Resuming session...");
                onResumeTimerRef.current();
              }
            }

          } else {
            // Face completely absent
            setPresenceScore(0);
            setAttentionScore(0);
            setPostureScore(0);
            currentAlerts.push("👤 USER ABSENT");

            if (timerRunning) {
              absentTicks++;
              if (absentTicks > 20) { // ~10 seconds (at 2 FPS processing rate)
                setTimeAway((prev) => prev + 10);
                setStatus("Study session paused. User absent.");
                onPauseTimerRef.current();
              } else {
                setStatus(`Verifying presence... (${Math.max(1, Math.ceil((20 - absentTicks) / 2))}s)`);
              }
            }
          }

          setAlerts(currentAlerts);
        });

        // 4 FPS CPU Throttle
        let lastProcessed = 0;
        const fpsInterval = 1000 / 2; // Process 2 frames per second for ultra-low CPU

        const runProcessing = async () => {
          if (!active) return;
          const now = performance.now();
          if (now - lastProcessed >= fpsInterval) {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              lastProcessed = now;
              try {
                await faceMeshInstance.send({ image: video });
              } catch (err) {
                console.error("FaceMesh send error:", err);
              }
            }
          }
          animationFrameRef.current = requestAnimationFrame(runProcessing);
        };

        // Delay starting the frames processing loop by 2.5s to let CDN files load
        setTimeout(() => {
          if (active) {
            runProcessing();
          }
        }, 2500);

      } catch (err) {
        console.error("Error setting up MediaPipe", err);
        setError("Failed to load computer vision models.");
      }
    }

    initMediaPipe();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceMeshInstance) {
        faceMeshInstance.close();
      }
    };
  }, [isActive, stream, error, pomodoroMode, timerRunning, onPauseTimer, onResumeTimer, baselineY]);

  // Recalibrate Posture
  const handleRecalibrate = () => {
    setBaselineY(null);
    setStatus("Recalibrating posture...");
  };

  const getBorderColor = () => {
    if (!timerRunning) return "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse";
    if (alerts.length > 0) return "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
    return "border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // SVG Sparkline path calculations
  const sparklinePath = focusHistory
    .map((val, idx) => {
      const x = (idx / 29) * 110; // 0 to 110px width
      const y = 35 - (val / 100) * 30; // 5 to 35px height range
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  if (!isActive || pomodoroMode !== "work") return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: 15 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: 15 }}
      transition={{ duration: 0.35 }}
      className={`card p-4 overflow-hidden relative border ${getBorderColor()} bg-[#0b0c14]/90 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="text-purple-400 animate-spin-slow" size={16} />
          <span className="text-xs font-black uppercase tracking-wider text-purple-300">
            Advanced AI Focus Monitor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalibrate}
            className="text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1 transition-colors"
            title="Recalibrate Study Posture"
          >
            <RefreshCw size={10} />
            <span>Calibrate</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-500 hover:text-gray-300 p-1 transition-colors"
            title={isMuted ? "Show Feed" : "Hide Feed"}
          >
            {isMuted ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Live Webcam and Alerts Overlay */}
        <div className="md:col-span-4 relative aspect-[4/3] bg-black/60 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover scale-x-[-1] rounded-xl ${isMuted ? "hidden" : "block"}`}
          />

          {!isMuted && !error && stream && (
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            />
          )}

          {isMuted ? (
            <div className="text-center p-2 flex flex-col items-center">
              <EyeOff className="text-gray-500 mb-1" size={16} />
              <span className="text-[9px] text-gray-500">Feed Hidden</span>
            </div>
          ) : error ? (
            <div className="text-center p-2 flex flex-col items-center">
              <ShieldAlert className="text-yellow-500 mb-1" size={16} />
              <span className="text-[8px] text-gray-400 leading-tight">No Camera</span>
            </div>
          ) : modelLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-1.5" />
              <span className="text-[9px] text-purple-300 font-bold uppercase tracking-widest animate-pulse">
                Loading AI Mesh...
              </span>
            </div>
          ) : null}

          {/* Glowing Scanning line overlay */}
          {!isMuted && !error && stream && !modelLoading && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_8px_#8b5cf6] opacity-60"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.35))]" />
            </div>
          )}

          {/* Floating alert pills */}
          <div className="absolute bottom-1.5 left-1.5 flex flex-col gap-1 z-20 pointer-events-none">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert}
                  initial={{ opacity: 0, x: -10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.9 }}
                  className={`text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider backdrop-blur-md flex items-center gap-1 ${
                    alert.includes("🚫")
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  }`}
                >
                  <AlertTriangle size={8} />
                  <span>{alert}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: HUD Focus Metrics Dials, Trend Chart & Counter */}
        <div className="md:col-span-8 flex flex-col justify-between py-0.5">
          {/* Top Info: Status message */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Focus Diagnostics
              </span>
              <span className={`text-[10px] font-black uppercase ${timerRunning ? "text-green-400" : "text-amber-400"}`}>
                {timerRunning ? "MONITORING ACTIVE" : "AUTO-PAUSED"}
              </span>
            </div>
            <p className="text-[11px] leading-tight text-gray-300 font-medium truncate mb-3">
              Status: <span className={alerts.length > 0 ? "text-red-400 font-bold" : "text-green-400 font-semibold"}>{status}</span>
            </p>
          </div>

          {/* Dials & Stats Container */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {/* Score 1: Focus */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 text-center relative overflow-hidden">
              <div className="text-xs font-black text-purple-300">{focusScore}%</div>
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Focus</div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" style={{ width: `${focusScore}%` }} />
            </div>

            {/* Score 2: Presence */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 text-center relative overflow-hidden">
              <div className="text-xs font-black text-blue-400">{presenceScore}%</div>
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Presence</div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-400" style={{ width: `${presenceScore}%` }} />
            </div>

            {/* Score 3: Attention */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 text-center relative overflow-hidden">
              <div className="text-xs font-black text-green-400">{attentionScore}%</div>
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Attention</div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-400" style={{ width: `${attentionScore}%` }} />
            </div>

            {/* Score 4: Posture */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 text-center relative overflow-hidden">
              <div className="text-xs font-black text-yellow-400">{postureScore}%</div>
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Posture</div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-400" style={{ width: `${postureScore}%` }} />
            </div>
          </div>

          {/* Lower HUD Section: Sparkline Chart & Diagnostics Counters */}
          <div className="flex gap-4 items-center">
            {/* Sparkline Canvas Chart */}
            <div className="flex-1 bg-black/35 rounded-lg p-2 border border-white/5 flex flex-col justify-between h-[52px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider">Focus Trend (90s)</span>
                <span className="text-[8px] text-purple-400 font-bold flex items-center gap-0.5">
                  <Zap size={8} /> Active
                </span>
              </div>
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 110 35">
                {/* Gradient for focus graph fill */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${sparklinePath} L 110 35 L 0 35 Z`}
                  fill="url(#chartGradient)"
                />
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Counters HUD */}
            <div className="grid grid-cols-2 gap-2 text-left shrink-0">
              <div className="flex items-center gap-1.5">
                <Clock className="text-gray-500" size={12} />
                <div>
                  <div className="text-[9px] font-black text-white">{formatTime(totalFocusedSecs)}</div>
                  <div className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Focused</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Moon className="text-blue-400" size={12} />
                <div>
                  <div className="text-[9px] font-black text-white">{sleepIncidents}</div>
                  <div className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Sleep</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <AlertTriangle className="text-yellow-500" size={12} />
                <div>
                  <div className="text-[9px] font-black text-white">{distractions}</div>
                  <div className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Distract</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <UserCheck className="text-green-400" size={12} />
                <div>
                  <div className="text-[9px] font-black text-white">{blinkCount}</div>
                  <div className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Blinks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
