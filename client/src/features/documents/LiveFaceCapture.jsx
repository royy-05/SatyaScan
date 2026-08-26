import React, { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { documentsApi } from "./api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Loader2, Camera as CameraIcon, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

export function LiveFaceCapture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [statusText, setStatusText] = useState("Center your face in the frame");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [webcamError, setWebcamError] = useState(false);

  // Challenge step sequence configuration
  const getStepInstruction = (s) => {
    switch (s) {
      case 1:
        return "Center your face in the frame";
      case 2:
        return "Slowly turn your head to the LEFT";
      case 3:
        return "Now turn your head to the RIGHT";
      case 4:
        return "Center your face again to complete";
      case 5:
        return "Capturing frame and verifying biometrics...";
      default:
        return "Follow head-turn challenge instructions";
    }
  };

  // Timer countdown
  useEffect(() => {
    if (step >= 5 || isSubmitting || isTimedOut || webcamError) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, isSubmitting, isTimedOut, webcamError]);

  // Handle head pose calculation from landmarks
  const handleResults = useCallback(
    (results) => {
      if (step >= 5 || isTimedOut || webcamError || isSubmitting) return;

      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        setFaceDetected(false);
        return;
      }

      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];

      // Estimate Yaw angle (Left / Right rotation) using Nose (1), Left cheek (234), Right cheek (454)
      const nose = landmarks[1];
      const leftCheek = landmarks[234];
      const rightCheek = landmarks[454];

      if (nose && leftCheek && rightCheek) {
        const dLeft = Math.abs(nose.x - leftCheek.x);
        const dRight = Math.abs(rightCheek.x - nose.x);
        const total = dLeft + dRight;

        if (total > 0) {
          const ratio = (dRight - dLeft) / total;
          const yawDegrees = ratio * 80;
          setCurrentYaw(yawDegrees);

          // Evaluate step progression criteria
          if (step === 1) {
            // Step 1: Center face (yaw within +/- 10 degrees)
            if (Math.abs(yawDegrees) <= 10) {
              setStep(2);
              setProgress(25);
              setStatusText(getStepInstruction(2));
              toast.info("Step 1 complete! Now turn head LEFT");
            }
          } else if (step === 2) {
            // Step 2: Turn head LEFT (yaw < -20)
            if (yawDegrees < -20) {
              setStep(3);
              setProgress(50);
              setStatusText(getStepInstruction(3));
              toast.info("Step 2 complete! Now turn head RIGHT");
            }
          } else if (step === 3) {
            // Step 3: Turn head RIGHT (yaw > 20)
            if (yawDegrees > 20) {
              setStep(4);
              setProgress(75);
              setStatusText(getStepInstruction(4));
              toast.info("Step 4 complete! Center face to complete");
            }
          } else if (step === 4) {
            // Step 4: Center face again
            if (Math.abs(yawDegrees) <= 10) {
              setStep(5);
              setProgress(100);
              setStatusText("Challenge complete! Capturing face...");
              triggerCaptureAndVerify();
            }
          }
        }
      }
    },
    [step, isTimedOut, webcamError, isSubmitting]
  );

  // Initialize MediaPipe FaceMesh & Camera Utility
  useEffect(() => {
    if (webcamError || isTimedOut) return;

    let cameraInstance = null;
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(handleResults);

    if (webcamRef.current && webcamRef.current.video) {
      cameraInstance = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
            await faceMesh.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      cameraInstance.start();
    }

    return () => {
      if (cameraInstance) {
        cameraInstance.stop();
      }
      faceMesh.close();
    };
  }, [handleResults, webcamError, isTimedOut]);

  // Capture current frame and submit to backend
  const triggerCaptureAndVerify = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsSubmitting(true);

    try {
      // Convert base64 data URL to File object
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], `selfie_${id}.jpg`, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("selfie", file);

      const response = await documentsApi.faceVerify(id, formData);
      const verification = response.data;
      const faceLayer = verification?.layers?.face;

      setMatchResult(faceLayer);
      toast.success("Face verification complete!");

      // Auto redirect to submission detail page after 2.5 seconds
      setTimeout(() => {
        navigate(`/app/submissions/${id}`);
      }, 2500);
    } catch (err) {
      toast.error("Face verification API request failed");
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setStep(1);
    setProgress(0);
    setTimeLeft(60);
    setIsTimedOut(false);
    setWebcamError(false);
    setMatchResult(null);
    setCapturedImage(null);
    setIsSubmitting(false);
    setStatusText(getStepInstruction(1));
  };

  const handleSkip = () => {
    toast.info("Skipped face verification. Redirecting to submission details.");
    navigate(`/app/submissions/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-cyan-400" />
          Live Face Verification
        </h1>
        <p className="text-xs text-slate-400">
          Complete the interactive head-turn challenge to verify identity against document photo.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-base text-slate-200">
            {isSubmitting
              ? "Analyzing Biometric Match..."
              : isTimedOut
                ? "Verification Timed Out"
                : webcamError
                  ? "Webcam Access Issue"
                  : statusText}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {!isTimedOut && !webcamError && !isSubmitting && (
              <span>Time remaining: <strong className="text-cyan-400">{timeLeft}s</strong></span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 flex flex-col items-center">
          {/* Progress Bar with Color Transition */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Verification Progress</span>
              <span className="font-mono text-cyan-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${progress < 40
                    ? "from-red-500 to-amber-500"
                    : progress < 80
                      ? "from-amber-500 to-emerald-400"
                      : "from-emerald-500 to-cyan-400"
                  }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Webcam Container */}
          <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-800 bg-black flex items-center justify-center shadow-inner">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured face frame" className="w-full h-full object-cover" />
            ) : !webcamError && !isTimedOut ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                  onUserMediaError={() => setWebcamError(true)}
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Face positioning oval overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className={`w-56 h-72 rounded-[45%] border-2 transition-all duration-300 ${faceDetected
                        ? "border-emerald-400/80 bg-emerald-500/5 shadow-[0_0_30px_rgba(52,211,153,0.2)]"
                        : "border-cyan-500/40 bg-cyan-500/5"
                      }`}
                  />
                </div>

                {/* Yaw angle indicator */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[11px] px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur border border-slate-800 text-slate-300">
                  <span>Face: {faceDetected ? "Detected" : "Searching..."}</span>
                  <span className="font-mono">Head Yaw: {currentYaw.toFixed(1)}°</span>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
                <p className="text-sm text-slate-300 font-medium">
                  {isTimedOut
                    ? "Verification timed out - please try again"
                    : "Webcam permission denied or camera not accessible."}
                </p>
              </div>
            )}

            {/* Submitting Loading Overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
                <p className="text-sm font-semibold text-cyan-300">Analyzing Biometric Match...</p>
                <p className="text-xs text-slate-400">Comparing face embedding against document photo</p>
              </div>
            )}
          </div>

          {/* Results Summary banner */}
          {matchResult && (
            <div className="w-full p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-emerald-300">Biometric Verification Complete</p>
                  <p className="text-xs text-slate-300">{matchResult.notes}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Match Score</p>
                <p className="text-lg font-bold font-mono text-emerald-400">
                  {((matchResult.confidence || 0) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-800 pt-4">
          <Button variant="outline" size="sm" onClick={handleSkip} disabled={isSubmitting}>
            Skip face verification
          </Button>

          {(isTimedOut || webcamError) && (
            <Button size="sm" onClick={handleRetry} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
              <RefreshCw className="h-4 w-4 mr-1" /> Retry Challenge
            </Button>
          )}

          {!isTimedOut && !webcamError && !isSubmitting && !matchResult && (
            <Button
              size="sm"
              onClick={() => {
                // Manual fallback trigger for development / test convenience
                setStep(5);
                setProgress(100);
                triggerCaptureAndVerify();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              Capture Frame Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
