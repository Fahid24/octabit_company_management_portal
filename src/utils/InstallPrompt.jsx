import React, { useEffect, useState } from "react";

const isIosDevice = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () =>
  "standalone" in window.navigator && (window.navigator).standalone;

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // iOS Safari - show custom message
  useEffect(() => {
    if (isIosDevice() && !isInStandaloneMode()) {
      setShowPrompt(true);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      // if (outcome === "accepted") {
      //   console.log("User accepted the install prompt");
      // } else {
      //   console.log("User dismissed the install prompt");
      // }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <img
        src="/odl.gif"
        alt="App Icon"
        style={{ width: 50, height: 50, marginRight: 16 }}
      />
      <div style={{ flexGrow: 1 }}>
        <p style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>
          Install our app for a better experience!
        </p>
      </div>
      <button
        onClick={handleInstall}
        style={{
          backgroundColor: "#3a41e2",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
          marginLeft: 16,
        }}
      >
        Install
      </button>
      <button
        onClick={handleClose}
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "#999",
          fontSize: "20px",
          marginLeft: 8,
          cursor: "pointer",
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default InstallPrompt;
