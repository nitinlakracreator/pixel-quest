import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={RootGame} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
