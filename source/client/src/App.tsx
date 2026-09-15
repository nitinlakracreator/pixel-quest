import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GameCanvas from "./components/GameCanvas";
import { useCallback, useState } from "react";
import WelcomePopup from "./components/WelcomePopup";

function RootGame() {
  const [showWelcome, setShowWelcome] = useState(true);
  const onWelcomeDone = useCallback(() => setShowWelcome(false), []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#1e1420" }}>
      <GameCanvas />
      {showWelcome && <WelcomePopup onDone={onWelcomeDone} />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <RootGame />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
