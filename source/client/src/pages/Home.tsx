/**
 * Pixel Quest — Ember Forge style.
 * Hosts the full-screen canvas game. Shows the "Welcome Nitin." startup
 * popup first, then hands over to the game engine.
 */
import { useCallback, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import WelcomePopup from "@/components/WelcomePopup";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  const onWelcomeDone = useCallback(() => setShowWelcome(false), []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#1e1420" }}>
      <GameCanvas />
      {showWelcome && <WelcomePopup onDone={onWelcomeDone} />}
    </div>
  );
}
