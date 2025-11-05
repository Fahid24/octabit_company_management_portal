"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  CheckIcon,
  Clock,
  LogIn,
  LogOut,
  MapPinIcon as MapPinCheck,
  QrCode,
  X,
} from "lucide-react";
import notificationSound from "@/assets/audio/notification.mp3";
import { toast } from "@/component/Toast";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import ConfirmDialog from "@/component/ConfirmDialog";

export function FingerPrintScanner({
  isCheckinLoading,
  isCheckoutLoading,
  locationData,
  attendanceType,
  locationPermission,
  refetch,
  data,
  checkoutMutation,
  checkinMutation,
  isQrVerified,
  onQrVerification,
  lateReason,
  shouldDisableFingerprint,
}) {
  const loginUser = useSelector((state) => state.userSlice.user);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState("qr");
  const [isHovering, setIsHovering] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessingQr, setIsProcessingQr] = useState(false);
  const [qrDetected, setQrDetected] = useState(false);

  const audioRef = useRef(null);
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const holdTimeout = useRef(null);
  const scanTimeout = useRef(null);
  const qrScanInterval = useRef(null);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  // Check today's attendance status
  const getTodayAttendanceStatus = () => {
    if (!data)
      return {
        hasCheckedIn: false,
        hasCheckedOut: false,
        checkInTime: null,
        checkOutTime: null,
      };

    const today = new Date().toDateString();
    const dataDate = new Date(data.date).toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (dataDate === today || dataDate === yesterdayStr) {
      const hasCheckedIn = !!data.checkIn;
      const hasCheckedOut = !!data.checkOut;

      return {
        hasCheckedIn,
        hasCheckedOut,
        checkInTime: data.checkIn ? new Date(data.checkIn) : null,
        checkOutTime: data.checkOut ? new Date(data.checkOut) : null,
      };
    }

    return {
      hasCheckedIn: false,
      hasCheckedOut: false,
      checkInTime: null,
      checkOutTime: null,
    };
  };

  const { hasCheckedIn, hasCheckedOut, checkInTime, checkOutTime } =
    getTodayAttendanceStatus();

  // Update mode based on attendance status
  useEffect(() => {
    if (!isQrVerified) {
      setMode("qr");
    } else if (hasCheckedIn && !hasCheckedOut) {
      setMode("out");
    } else if (hasCheckedIn && hasCheckedOut) {
      setMode("complete");
    } else {
      setMode("in");
    }
  }, [hasCheckedIn, hasCheckedOut, isQrVerified]);

  // Format time with seconds
  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate working time
  const calculateWorkingTime = () => {
    if (!checkInTime) return "00:00:00";

    const endTime = checkOutTime || new Date();
    const diffMs = endTime.getTime() - checkInTime.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Create audio element for the "tring" sound
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    return () => {
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
      if (holdTimeout.current) clearTimeout(holdTimeout.current);
      if (qrScanInterval.current) clearInterval(qrScanInterval.current);
      stopCamera();
    };
  }, []);

  // Function to handle vibration
  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // Function to play sound
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.error("Error playing sound:", err));
    }
  };

  // Check if attendance is allowed (location and attendance type required)
  const isAttendanceAllowed = () => {
    return (
      locationPermission === "granted" &&
      attendanceType &&
      locationData &&
      isQrVerified
    );
  };

  // Handle QR camera button click
  const handleQrCameraClick = () => {
    if (showCamera) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      setCameraError(null);
      setShowCamera(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              startQrScanning();
            })
            .catch((error) => {
              setCameraError("Failed to start video playback");
            });
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
      let errorMessage = "Unable to access camera. ";

      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (error.name === "NotReadableError") {
        errorMessage += "Camera is already in use by another application.";
      } else {
        errorMessage += "Please check camera permissions and try again.";
      }

      setCameraError(errorMessage);
      toast.error("Camera Error", errorMessage);
      setShowCamera(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
      setCameraStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setShowCamera(false);
    setQrDetected(false);

    if (qrScanInterval.current) {
      clearInterval(qrScanInterval.current);
      qrScanInterval.current = null;
    }
  };

  // QR Code detection using jsQR library
  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      import("jsqr")
        .then((jsQR) => {
          const code = jsQR.default(
            imageData.data,
            imageData.width,
            imageData.height,
            {
              inversionAttempts: "dontInvert",
            }
          );

          if (code && code.data) {
            setQrDetected(true);
            handleQrSubmit(code.data);
          }
        })
        .catch((error) => {
          console.error("jsQR import error:", error);
        });
    } catch (error) {
      console.error("QR detection error:", error);
    }

    return null;
  };

  // Start QR scanning process
  const startQrScanning = () => {
    if (qrScanInterval.current) clearInterval(qrScanInterval.current);

    qrScanInterval.current = setInterval(() => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        !isProcessingQr
      ) {
        detectQRCode();
      }
    }, 300);
  };

  // Handle QR Code submission for verification
  const handleQrSubmit = async (qrValue) => {
    if (!qrValue || isProcessingQr) return;

    setIsProcessingQr(true);
    setScanning(true);

    if (qrScanInterval.current) {
      clearInterval(qrScanInterval.current);
    }

    try {
      // For QR verification, we only send the QR code
      const verificationData = {
        QRCode: qrValue,
      };

      // Call the checkin API with only QR code for verification
      const result = await checkinMutation(verificationData).unwrap();

      // Success - QR is verified
      setScanning(false);
      setIsProcessingQr(false);
      setSuccess(true);
      stopCamera();
      vibrate();
      playSound();
      onQrVerification(true);

      toast.success(
        "QR Code Verified",
        "QR code verified successfully! You can now use fingerprint for attendance."
      );

      setTimeout(() => {
        setMode("in");
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setScanning(false);
      setIsProcessingQr(false);

      setTimeout(() => {
        if (showCamera && videoRef.current) {
          startQrScanning();
        }
      }, 2000);

      toast.error(
        "QR Code Invalid",
        error?.data?.message || "Invalid QR code. Please try again."
      );
    }
  };

  // Handle hold start for fingerprint
  const handleHoldStart = (e) => {
    if (
      scanning ||
      success ||
      isCheckinLoading ||
      isCheckoutLoading ||
      mode === "complete" ||
      !isQrVerified
    )
      return;

    if (e.type === "mousedown") {
      setMouseIsDown(true);
    }

    setIsHolding(true);
    setScanning(true);

    holdTimeout.current = setTimeout(async () => {
      // If it's checkout mode, show confirmation modal after 2 seconds
      if (mode === "out") {
        setScanning(false);
        setIsHolding(false);
        setShowConfirmModal(true);
      } else {
        // For check-in, proceed directly
        await processAttendance();
      }
    }, 2000);
  };

  // Process attendance (checkin or checkout) with full data
  const processAttendance = async () => {
    try {
      let result;
      const location = {
        address: locationData?.address,
        longitude: locationData?.longitude,
        latitude: locationData?.latitude,
        type: attendanceType,
      };

      const data1 = {
        employeeId: loginUser?.user?._id,
        checkInLocation: location,
        lateReason: lateReason || null,
      };
      const data2 = {
        employeeId: loginUser?.user?._id,
        checkOutLocation: location,
      };

      if (mode === "in") {
        result = await checkinMutation(data1).unwrap();
      } else {
        result = await checkoutMutation(data2).unwrap();
      }

      await refetch();

      setScanning(false);
      setSuccess(true);
      vibrate();
      playSound();

      toast.success(
        mode === "in" ? "Check-in Successful" : "Check-out Successful",
        mode === "in"
          ? "Your check-in has been successfully recorded."
          : "Your check-out has been successfully recorded."
      );

      if (mode === "in") {
        setTimeout(() => {
          setSuccess(false);
          setMode("out");
        }, 3000);
      } else {
        setTimeout(() => {
          setSuccess(false);
          setMode("complete");
        }, 3000);
      }
    } catch (error) {
      setScanning(false);
      toast.error(
        "Operation Failed",
        error?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsHolding(false);
      setMouseIsDown(false);
    }
  };

  // Handle hold end
  const handleHoldEnd = (e) => {
    if (e?.type === "mouseup") {
      setMouseIsDown(false);
    }

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }

    if (isHolding && !success) {
      setScanning(false);
      setIsHolding(false);
    }
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    // Don't show scanning animation again, just process the checkout
    await processAttendance();
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    resetScanner();
  };

  const handleHoldCancel = () => {
    handleHoldEnd();
  };

  const handleMouseLeave = () => {
    if (!mouseIsDown && isHolding) {
      handleHoldCancel();
    }
  };

  // Reset the scanner
  const resetScanner = () => {
    setScanning(false);
    setSuccess(false);
    setQrDetected(false);
    stopCamera();
  };

  // Global mouse up listener for desktop
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      if (mouseIsDown) {
        handleHoldEnd(e);
      }
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [mouseIsDown, isHolding]);

  // Get title based on mode and status
  const getTitle = () => {
    if (!isQrVerified) return "Scan QR Code to Unlock";
    if (mode === "complete") return "Attendance Complete";
    if (mode === "in") return "Attendance Check-In";
    return "Attendance Check-Out";
  };

  // Check if scanner should be disabled
  const isScannerDisabled = () => {
    return (
      scanning || isCheckinLoading || isCheckoutLoading || mode === "complete"
    );
  };

  // Get button colors based on mode
  const getButtonColors = () => {
    if (!isQrVerified) {
      return {
        border: "border-blue-500/30",
        icon: "text-blue-600",
        waves: "border-blue-500",
      };
    } else if (mode === "in") {
      return {
        border: "border-green-500/30",
        icon: "text-green-600",
        waves: "border-green-500",
      };
    } else if (mode === "out") {
      return {
        border: "border-red-500/30",
        icon: "text-red-600",
        waves: "border-red-500",
      };
    } else {
      return {
        border: "border-primary/30",
        icon: "text-primary",
        waves: "border-primary",
      };
    }
  };

  const buttonColors = getButtonColors();

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
      <ConfirmDialog
        open={showConfirmModal}
        title="Confirm Checkout"
        message="Are you sure you want to check out? This will mark the end of your work day."
        confirmText="Yes, Check Out"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isQrVerified
                  ? "Scan QR Code"
                  : "Scan QR Code to Unlock Attendance"}
              </h3>
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-80 bg-black rounded-lg object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning overlay with corner markers */}
              <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-green-400"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-green-400"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-green-400"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-green-400"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 animate-pulse"></div>
              </div>

              {/* QR Detected indicator */}
              {qrDetected && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-lg">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                    QR Code Detected!
                  </div>
                </div>
              )}

              {/* Processing overlay */}
              {isProcessingQr && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">
                      {isQrVerified
                        ? "Processing QR Code..."
                        : "Verifying QR Code..."}
                    </p>
                    <p className="text-sm opacity-75">Please wait</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">
                {isProcessingQr
                  ? isQrVerified
                    ? "Processing QR code..."
                    : "Verifying QR code..."
                  : "Position the QR code within the frame"}
              </p>
              {!isQrVerified && (
                <p className="text-xs text-blue-600 mt-2">
                  This will unlock your attendance features
                </p>
              )}
            </div>

            {/* Camera Error */}
            {cameraError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{cameraError}</p>
                <button
                  onClick={() => {
                    setCameraError(null);
                    window.location.reload();
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Reload site and try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-primary">{getTitle()}</h2>

      {/* QR Scanner (Always visible first) */}
      {!isQrVerified && (
        <div className="relative scale-75 lg:scale-100">
          <button
            onClick={handleQrCameraClick}
            disabled={isScannerDisabled()}
            className={`
                            relative
                            w-64 h-64
                            rounded-full
                            flex items-center justify-center
                            overflow-hidden
                            transition-all duration-500
                            bg-transparent
                            border-2 ${buttonColors.border}
                            ${showCamera ? "scale-95" : ""}
                            ${success ? "scale-95" : ""}
                            shadow-lg
                            focus:outline-none
                            disabled:cursor-not-allowed
                            hover:scale-105
                        `}
          >
            {!success && (
              <div
                className={`select-none ${buttonColors.icon} ${
                  showCamera ? "animate-pulse" : ""
                }`}
              >
                <QrCode className="h-24 w-24" />
              </div>
            )}

            {success && (
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="bg-green-500 text-white rounded-full p-4 animate-success">
                  <CheckIcon className="h-12 w-12" />
                </div>
                <span className="mt-2 text-sm font-medium text-green-600">
                  QR Verified! Attendance Unlocked
                </span>
              </div>
            )}

            {showCamera && !success && (
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <h3 className={`text-sm font-medium ${buttonColors.icon}`}>
                  Camera Active
                </h3>
              </div>
            )}
          </button>

          {showCamera && (
            <>
              <div
                className={`absolute inset-0 rounded-full border-4 ${buttonColors.waves}/30 animate-wave-1`}
              ></div>
              <div
                className={`absolute inset-0 rounded-full border-4 ${buttonColors.waves}/20 animate-wave-2`}
              ></div>
              <div
                className={`absolute inset-0 rounded-full border-4 ${buttonColors.waves}/10 animate-wave-3`}
              ></div>
            </>
          )}
        </div>
      )}

      {/* Fingerprint Scanner - Only show after QR verification */}
      {isQrVerified && (
        <div className="relative scale-75 lg:scale-100">
          <button
            ref={scannerRef}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={handleHoldCancel}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsHovering(true)}
            disabled={
              isScannerDisabled() ||
              !isAttendanceAllowed() ||
              shouldDisableFingerprint
            }
            className={`
                            relative
                            w-64 h-64
                            rounded-full
                            flex items-center justify-center
                            overflow-hidden
                            transition-all duration-500
                            bg-transparent
                            border-2 ${buttonColors.border}
                            ${scanning ? "scale-95" : ""}
                            ${success || mode === "complete" ? "scale-95" : ""}
                            shadow-lg
                            focus:outline-none
                            disabled:cursor-not-allowed
                            ${mode === "complete" ? "opacity-75" : ""}
                            ${!isAttendanceAllowed() ? "opacity-50" : ""}
                        `}
          >
            <div className="fingerprint-container relative w-full h-full flex items-center justify-center">
              {!success && mode !== "complete" && (
                <div
                  className={`select-none h-40 w-40 ${buttonColors.icon} ${
                    scanning ? "animate-pulse" : ""
                  }`}
                >
                  <svg
                    fill="currentColor"
                    height="10rem"
                    width="10rem"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 60 60"
                    xmlSpace="preserve"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <g>
                        <path d="M1,19c0.552,0,1-0.448,1-1V2h16c0.552,0,1-0.448,1-1s-0.448-1-1-1H0v18C0,18.552,0.448,19,1,19z" />
                        <path d="M59,42c-0.552,0-1,0.448-1,1v15H43c-0.552,0,1-0.448-1,1s0.448,1,1,1h17V43C60,42.448,59.552,42,59,42z" />
                        <path d="M43,0c-0.552,0-1,0.448-1,1s0.448,1,1,1h15v16c0,0.552,0.448,1,1,1s1-0.448,1-1V0H43z" />
                        <path d="M18,58H2V43c0-0.552-0.448-1-1-1s-1,0.448-1,1v17h18c0.552,0,1-0.448,1-1S18.552,58,18,58z" />
                        <path d="M32.743,51.946c0.61-17.503-1.61-22.969-1.705-23.193c-0.214-0.507-0.794-0.742-1.304-0.531 c-0.508,0.211-0.749,0.795-0.54,1.305c0.021,0.052,2.14,5.439,1.55,22.35c-0.019,0.552,0.413,1.015,0.965,1.034 c0.012,0,0.023,0,0.035,0C32.28,52.911,32.724,52.486,32.743,51.946z" />
                        <path d="M17.08,12.307c0.301,0.463,0.921,0.595,1.383,0.293c1.197-0.778,2.508-1.466,3.899-2.046C24.833,9.523,27.441,9,30.118,9 c8.109,0,15.391,4.826,18.55,12.294c1.26,2.978,1.981,5.929,2.337,9.571c0.05,0.517,0.485,0.903,0.994,0.903 c0.032,0,0.065-0.001,0.098-0.005c0.55-0.054,0.952-0.542,0.898-1.092c-0.376-3.853-1.143-6.985-2.485-10.156 C47.036,12.305,39.032,7,30.118,7c-2.942,0-5.811,0.575-8.525,1.708c-1.501,0.626-2.921,1.371-4.219,2.215 C16.91,11.224,16.779,11.844,17.08,12.307z" />
                        <path d="M15.206,13.803c-0.388-0.394-1.021-0.399-1.414-0.011c-3.967,3.909-6.149,9.159-6.311,15.182 c-0.092,3.412,0.451,7.121,1.614,11.025c0.129,0.434,0.527,0.715,0.958,0.715c0.095,0,0.191-0.014,0.286-0.042 c0.529-0.158,0.831-0.715,0.673-1.244c-1.103-3.701-1.618-7.2-1.532-10.4c0.15-5.575,2.073-10.222,5.715-13.811 C15.588,14.829,15.593,14.196,15.206,13.803z" />
                        <path d="M44.822,24.893c0.455,1.342,0.796,2.737,1.042,4.266c0.613,3.813,0.631,8.411,0.462,14.593 c-0.015,0.552,0.42,1.012,0.972,1.027c0.009,0,0.019,0,0.028,0c0.54,0,0.984-0.43,0.999-0.973 c0.172-6.298,0.151-10.998-0.486-14.965c-0.264-1.64-0.631-3.142-1.123-4.591c-2.232-6.581-9.395-12.125-15.966-12.36 c-2.519-0.09-4.964,0.354-7.279,1.321c-6.393,2.667-10.563,8.861-10.622,15.78v0v0v0v0c-0.014,1.633,0.206,3.262,0.653,4.842 c0.234,0.825,0.473,1.703,0.6,2.57c0.275,1.877,0.577,5.382,0.45,11.422c-0.011,0.552,0.427,1.009,0.979,1.021 c0.007,0,0.014,0,0.021,0c0.542,0,0.988-0.434,1-0.979c0.129-6.178-0.186-9.802-0.472-11.753c-0.144-0.986-0.402-1.937-0.655-2.826 c-0.396-1.396-0.59-2.836-0.577-4.279l0,0l0,0c0.052-6.116,3.738-11.593,9.392-13.951c2.046-0.854,4.213-1.251,6.437-1.167 C36.39,14.093,42.867,19.133,44.822,24.893z" />
                        <path d="M24.186,20.625c0.452-0.317,0.561-0.941,0.244-1.393c-0.317-0.451-0.941-0.561-1.393-0.244 c-3.13,2.197-4.993,5.835-5.111,9.982c0,0.001,0,0.002,0,0.003c-0.041,1.435,0.131,2.873,0.509,4.267 c0,0.003,0.026,0.096,0.027,0.099c0.854,3.129,1.176,9.135,0.905,16.911c-0.019,0.552,0.413,1.015,0.965,1.034 c0.012,0,0.023,0,0.035,0c0.536,0,0.98-0.425,0.999-0.965c0.282-8.087-0.055-14.141-0.999-17.596 c-0.329-1.212-0.478-2.455-0.442-3.694c0,0,0-0.001,0-0.002C20.024,25.519,21.577,22.456,24.186,20.625z" />
                        <path d="M42.28,48.845c0.012,0,0.023,0,0.035,0c0.536,0,0.98-0.425,0.999-0.965c0.343-9.832,0.361-14.919-0.439-19.07 c0,0.001,0-0.002,0-0.003c-0.309-1.602-0.751-3.07-1.352-4.49c-1.943-4.592-6.419-7.559-11.405-7.559 c-0.896,0-1.79,0.097-2.656,0.288c-0.54,0.119-0.88,0.652-0.762,1.191c0.118,0.54,0.651,0.879,1.191,0.762 c0.726-0.16,1.475-0.241,2.226-0.241c4.181,0,7.935,2.488,9.563,6.338c0.545,1.29,0.948,2.628,1.23,4.092c0,0.001,0,0.001,0,0.002 c0.763,3.96,0.741,8.945,0.403,18.619C41.296,48.362,41.728,48.825,42.28,48.845z" />
                        <path d="M37.544,45.219c-0.002,0-0.005,0-0.007,0c-0.549,0-0.996,0.443-1,0.993c-0.004,0.642-0.013,1.304-0.026,1.987 c-0.01,0.552,0.429,1.008,0.981,1.019c0.006,0,0.013,0,0.02,0c0.543,0,0.989-0.435,1-0.981c0.013-0.69,0.022-1.361,0.026-2.011 C38.541,45.673,38.096,45.223,37.544,45.219z" />
                        <path d="M25.428,29.028c0.051-1.851,1.182-3.505,2.883-4.214c0.577-0.241,1.185-0.363,1.807-0.363c1.889,0,3.585,1.124,4.324,2.872 c0.119,0.282,0.368,0.869,0.652,1.936c0.557,2.085,1.255,6.02,1.413,12.918c0.012,0.544,0.458,0.977,0.999,0.977 c0.008,0,0.016,0,0.023,0c0.552-0.012,0.989-0.47,0.977-1.022c-0.128-5.617-0.64-10.246-1.479-13.389 c-0.321-1.201-0.606-1.875-0.747-2.207c-1.05-2.481-3.469-4.084-6.163-4.084c-0.888,0-1.755,0.174-2.577,0.517 c-2.426,1.012-4.04,3.369-4.112,6.005c-0.024,0.884,0.125,1.752,0.426,2.528c0.07,0.216,1.713,5.455,1.199,20.179 c-0.019,0.552,0.413,1.015,0.965,1.034c0.012,0,0.023,0,0.035,0c0.536,0,0.98-0.425,0.999-0.965 c0.517-14.818-1.109-20.291-1.314-20.917C25.516,30.253,25.411,29.646,25.428,29.028z" />
                        <circle cx="5" cy="55" r="1" />
                        <circle cx="9" cy="55" r="1" />
                        <circle cx="13" cy="55" r="1" />
                        <circle cx="11" cy="53" r="1" />
                        <circle cx="15" cy="53" r="1" />
                        <circle cx="17" cy="55" r="1" />
                        <circle cx="21" cy="55" r="1" />
                        <circle cx="19" cy="53" r="1" />
                        <circle cx="7" cy="53" r="1" />
                        <circle cx="25" cy="55" r="1" />
                        <circle cx="29" cy="55" r="1" />
                        <circle cx="33" cy="55" r="1" />
                        <circle cx="35" cy="53" r="1" />
                        <circle cx="23" cy="53" r="1" />
                        <circle cx="37" cy="55" r="1" />
                        <circle cx="41" cy="55" r="1" />
                        <circle cx="39" cy="53" r="1" />
                        <circle cx="45" cy="55" r="1" />
                        <circle cx="49" cy="55" r="1" />
                        <circle cx="53" cy="55" r="1" />
                        <circle cx="51" cy="53" r="1" />
                        <circle cx="55" cy="53" r="1" />
                        <circle cx="43" cy="53" r="1" />
                        <circle cx="47" cy="53" r="1" />
                        <circle cx="5" cy="51" r="1" />
                        <circle cx="9" cy="51" r="1" />
                        <circle cx="13" cy="51" r="1" />
                        <circle cx="11" cy="49" r="1" />
                        <circle cx="17" cy="51" r="1" />
                        <circle cx="7" cy="49" r="1" />
                        <circle cx="45" cy="51" r="1" />
                        <circle cx="49" cy="51" r="1" />
                        <circle cx="53" cy="51" r="1" />
                        <circle cx="51" cy="49" r="1" />
                        <circle cx="55" cy="49" r="1" />
                        <circle cx="47" cy="49" r="1" />
                        <circle cx="5" cy="47" r="1" />
                        <circle cx="9" cy="47" r="1" />
                        <circle cx="7" cy="45" r="1" />
                        <circle cx="49" cy="47" r="1" />
                        <circle cx="53" cy="47" r="1" />
                        <circle cx="51" cy="45" r="1" />
                        <circle cx="55" cy="45" r="1" />
                        <circle cx="5" cy="43" r="1" />
                        <circle cx="9" cy="43" r="1" />
                        <circle cx="7" cy="41" r="1" />
                        <circle cx="53" cy="43" r="1" />
                        <circle cx="55" cy="41" r="1" />
                        <circle cx="5" cy="39" r="1" />
                        <circle cx="53" cy="39" r="1" />
                        <circle cx="55" cy="37" r="1" />
                        <circle cx="5" cy="35" r="1" />
                        <circle cx="53" cy="35" r="1" />
                        <circle cx="55" cy="33" r="1" />
                      </g>
                    </g>
                  </svg>
                </div>
              )}

              {scanning && !success && <div className="scan-bar"></div>}

              {(success || mode === "complete") && (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="bg-green-500 text-white rounded-full p-4 animate-success">
                    <CheckIcon className="h-12 w-12" />
                  </div>
                  <span className="mt-2 text-sm font-medium text-green-600">
                    {mode === "complete"
                      ? "All done for today!"
                      : `${
                          mode === "in"
                            ? "Check-in"
                            : mode === "out"
                            ? "Check-out"
                            : "Scanned"
                        } successful!`}
                  </span>
                </div>
              )}

              {scanning && (
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <h3 className="scan-text">Scanning...</h3>
                </div>
              )}
            </div>
          </button>

          {scanning && (
            <>
              <div
                className={`absolute inset-0 rounded-full border-4 ${buttonColors.waves}/30 animate-wave-1`}
              ></div>
              <div
                className={`absolute inset-0 rounded-full border-4 ${buttonColors.waves}/20 animate-wave-2`}
              ></div>
              <div
                className={`absolute inset-0 rounded-full border-4 ${buttonColors.waves}/10 animate-wave-3`}
              ></div>
            </>
          )}
        </div>
      )}

      {/* Enhanced Attendance Display */}
      {isQrVerified && (checkInTime || checkOutTime) && (
        <div className="w-full max-w-2xl space-y-4">
          {/* Working Hours Card */}
          {checkInTime && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-primary">
                      Working Hours
                    </h3>
                    <p className="text-xs text-primary">
                      {checkOutTime ? "Total time worked" : "Time elapsed"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary font-mono">
                    {calculateWorkingTime()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Times Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 shadow-lg animate-slide-up">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Today's Attendance
              </h3>
            </div>

            <div className="space-y-3 lg:space-y-0 lg:grid grid-cols-2 items-end gap-4">
              {checkInTime && (
                <div className="flex  items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-400 animate-fade-in-delay-1">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <LogIn className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Check-in
                      </span>
                      <p className="text-xs text-gray-500">
                        Started work from: {data?.checkInLocation?.from}
                      </p>
                      <p className="text-xs flex items-start gap-1 text-gray-500">
                        {" "}
                        <MapPinCheck size={18} />
                        {data?.checkInLocation?.locationName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-nowrap text-sm text-green-600 font-semibold">
                        {formatTime(checkInTime)}
                      </span>
                      <div className="bg-green-500 p-1  rounded-full animate-pulse">
                        <CheckIcon className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(checkInTime)}
                    </p>
                  </div>
                </div>
              )}

              {checkOutTime && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-red-400 animate-fade-in-delay-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Check-out
                      </span>
                      <p className="text-xs text-gray-500">
                        Finished from: {data?.checkOutLocation?.from}
                      </p>
                      <p className="text-xs gap-1 flex items-start text-gray-500">
                        <MapPinCheck size={18} />{" "}
                        {data?.checkInLocation?.locationName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-nowrap text-sm text-red-600 font-semibold">
                        {formatTime(checkOutTime)}
                      </span>
                      <div className="bg-green-500 p-1 rounded-full animate-pulse">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {" "}
                      {formatDate(checkOutTime)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status text */}
      <div className="text-center">
        <p className="text-gray-700">
          {!isQrVerified
            ? "Click the QR code button to scan and unlock attendance features"
            : !isAttendanceAllowed()
            ? "Please allow location access to continue"
            : scanning
            ? isHolding
              ? "Hold for 2 seconds to complete..."
              : "Processing..."
            : success
            ? `${
                mode === "in"
                  ? "Check-in"
                  : mode === "out"
                  ? "Check-out"
                  : "Scanned"
              } successful!`
            : mode === "complete"
            ? "Attendance completed for today"
            : `Press and hold to ${mode === "in" ? "check in" : "check out"}`}
        </p>

        {(isCheckinLoading || isCheckoutLoading) && (
          <p className="text-sm text-primary mt-2">Connecting to server...</p>
        )}

        {mode === "complete" && isQrVerified && (
          <p className="text-sm text-green-600 mt-2">
            {"You've completed both check-in and check-out for today"}
          </p>
        )}

        {!isQrVerified && (
          <p className="text-sm text-blue-600 mt-2">
            QR verification is required once per session to unlock attendance
            features
          </p>
        )}
      </div>

      {/* Status indicators - Only show after QR verification */}
      {isQrVerified && (
        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                hasCheckedIn ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {hasCheckedIn && <CheckIcon className="h-3 w-3 text-white" />}
            </div>
            <span className={hasCheckedIn ? "text-green- font-medium" : ""}>
              Check In
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                hasCheckedOut ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {hasCheckedOut && <CheckIcon className="h-3 w-3 text-white" />}
            </div>
            <span className={hasCheckedOut ? "text-green- font-medium" : ""}>
              Check Out
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

FingerPrintScanner.propTypes = {
  isCheckinLoading: PropTypes.bool,
  isCheckoutLoading: PropTypes.bool,
  locationData: PropTypes.shape({
    address: PropTypes.string,
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  attendanceType: PropTypes.string,
  locationPermission: PropTypes.string,
  refetch: PropTypes.func,
  data: PropTypes.object,
  checkoutMutation: PropTypes.func,
  checkinMutation: PropTypes.func,
  isQrVerified: PropTypes.bool,
  onQrVerification: PropTypes.func,
};
