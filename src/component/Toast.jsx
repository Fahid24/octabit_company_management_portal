"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

// Unique ID generator for toasts
const generateId = () =>
  `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Toast types
const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
};

// Default positions
const POSITIONS = {
  TOP_RIGHT: "top-right",
  TOP_LEFT: "top-left",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_LEFT: "bottom-left",
  TOP_CENTER: "top-center",
  BOTTOM_CENTER: "bottom-center",
};

// Global toast state
let toasts = [];
let listeners = [];

// Function to notify all listeners of state changes
const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

// Toast manager functions
const toastManager = {
  // Add a new toast
  add: (toast) => {
    const id = toast.id || generateId();
    const newToast = { ...toast, id };
    toasts = [...toasts, newToast];
    notifyListeners();
    return id;
  },

  // Remove a toast by ID
  remove: (id) => {
    toasts = toasts.filter((toast) => toast.id !== id);
    notifyListeners();
  },

  // Update an existing toast
  update: (id, updatedToast) => {
    toasts = toasts.map((toast) =>
      toast.id === id ? { ...toast, ...updatedToast } : toast
    );
    notifyListeners();
  },

  // Remove all toasts
  removeAll: () => {
    toasts = [];
    notifyListeners();
  },

  // Subscribe to toast changes
  subscribe: (listener) => {
    listeners.push(listener);
    listener([...toasts]); // Initial state
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

// Helper functions to create different types of toasts
export const toast = {
  success: (title, message, duration = 5000) => {
    return toastManager.add({
      type: TOAST_TYPES.SUCCESS,
      title,
      message,
      duration,
    });
  },

  error: (title, message, duration = 5000) => {
    return toastManager.add({
      type: TOAST_TYPES.ERROR,
      title,
      message,
      duration,
    });
  },

  warning: (title, message, duration = 5000) => {
    return toastManager.add({
      type: TOAST_TYPES.WARNING,
      title,
      message,
      duration,
    });
  },

  info: (title, message, duration = 5000) => {
    return toastManager.add({
      type: TOAST_TYPES.INFO,
      title,
      message,
      duration,
    });
  },

  loading: (title, message) => {
    return toastManager.add({
      type: TOAST_TYPES.LOADING,
      title,
      message,
      duration: Number.POSITIVE_INFINITY,
    });
  },

  update: (id, props) => {
    toastManager.update(id, props);
  },

  dismiss: (id) => {
    toastManager.remove(id);
  },

  dismissAll: () => {
    toastManager.removeAll();
  },
};

// Individual Toast component
const ToastItem = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [startTime, setStartTime] = useState(Date.now());
  const [pausedAt, setPausedAt] = useState(null);

  // Handle automatic closing and progress bar
  useEffect(() => {
    // Don't auto-close loading toasts
    if (type === TOAST_TYPES.LOADING) return;

    // If paused, save when we paused
    if (isPaused) {
      setPausedAt(Date.now());
      return;
    } else if (pausedAt) {
      // If we're resuming from a pause, adjust the start time
      const pauseDuration = Date.now() - pausedAt;
      setStartTime((prevStartTime) => prevStartTime + pauseDuration);
      setPausedAt(null);
    }

    // Set up the countdown timer
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        handleClose();
      }
    }, 10); // Update frequently for smooth animation

    return () => clearInterval(timer);
  }, [isPaused, duration, type]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for animation to complete
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case TOAST_TYPES.ERROR:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case TOAST_TYPES.WARNING:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case TOAST_TYPES.LOADING:
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return "border-l-green-500";
      case TOAST_TYPES.ERROR:
        return "border-l-red-500";
      case TOAST_TYPES.WARNING:
        return "border-l-amber-500";
      case TOAST_TYPES.LOADING:
        return "border-l-primary";
      default:
        return "border-l-blue-500";
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return "bg-green-500";
      case TOAST_TYPES.ERROR:
        return "bg-red-500";
      case TOAST_TYPES.WARNING:
        return "bg-amber-500";
      case TOAST_TYPES.LOADING:
        return "bg-primary";
      default:
        return "bg-blue-500";
    }
  };

  const progressPercentage = (timeLeft / duration) * 100;

  const cn = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg border-l-4 transition-all duration-300 ease-in-out",
        getBorderColor(),
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      {/* Progress bar */}
      {type !== TOAST_TYPES.LOADING && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200">
          <div
            className={`h-full ${getProgressColor()}`}
            style={{
              width: `${progressPercentage}%`,
              transition: isPaused ? "none" : "width 100ms linear",
            }}
          />
        </div>
      )}

      <div className="flex-shrink-0 p-4">{getIcon()}</div>
      <div className="flex-1 p-4 pt-3 pr-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

// Toast container component
const ToastContainer = ({ position = POSITIONS.TOP_RIGHT }) => {
  const [currentToasts, setCurrentToasts] = useState([]);

  // Subscribe to toast changes
  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setCurrentToasts);
    return unsubscribe;
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case POSITIONS.TOP_LEFT:
        return "top-0 left-0";
      case POSITIONS.TOP_CENTER:
        return "top-0 left-1/2 -translate-x-1/2";
      case POSITIONS.TOP_RIGHT:
        return "top-0 right-0";
      case POSITIONS.BOTTOM_LEFT:
        return "bottom-0 left-0";
      case POSITIONS.BOTTOM_CENTER:
        return "bottom-0 left-1/2 -translate-x-1/2";
      case POSITIONS.BOTTOM_RIGHT:
        return "bottom-0 right-0";
      default:
        return "top-0 right-0";
    }
  };

  // Only render if we're in a browser environment
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className={`fixed z-[999999] m-4 flex flex-col gap-2 ${getPositionClasses()}`}
      aria-live="polite"
    >
      {currentToasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={toastManager.remove} />
      ))}
    </div>,
    document.body
  );
};

// Export the ToastContainer and toast functions
export { ToastContainer, POSITIONS };
