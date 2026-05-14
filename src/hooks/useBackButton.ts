import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

/**
 * Intercepts the Android hardware back button when running inside Capacitor.
 *
 * - On "/" (home): does nothing (Capacitor's default behaviour minimises the app).
 * - On any other route with history: navigate(-1).
 * - On any other route without history: navigate("/").
 *
 * Uses the `backbutton` document event that @capacitor/core dispatches natively,
 * so no additional @capacitor/app package is required.
 */
export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only activate on real native (Android / iOS) builds.
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = (ev: Event) => {
      if (location.pathname === "/") {
        // Let Capacitor handle it naturally → minimises the app on Android.
        return;
      }

      // Prevent the default exit behaviour.
      ev.preventDefault();
      ev.stopPropagation();

      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    };

    document.addEventListener("backbutton", handleBackButton, false);
    return () => {
      document.removeEventListener("backbutton", handleBackButton, false);
    };
  }, [navigate, location.pathname]);
}

