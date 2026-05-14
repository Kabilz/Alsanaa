import { useBackButton } from "@/hooks/useBackButton";

/**
 * Must be rendered inside <BrowserRouter>.
 * Registers the Capacitor / PWA back-button handler.
 */
const BackButtonHandler = () => {
  useBackButton();
  return null;
};

export default BackButtonHandler;
