import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fullText = "Hyperliquid Nexus: Wallets, stablecoin data, Goldsky transactions, and Whale Alert Telegram — all in one place";

export default function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, currentIndex + 1));
      currentIndex++;
      if (currentIndex === fullText.length) {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 60); // typing speed in ms per character
    return () => clearInterval(interval);
  }, []);

  // When typing done, wait a moment then call onFinish
  useEffect(() => {
    if (isTypingDone) {
      const timeout = setTimeout(() => {
        onFinish();
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [isTypingDone, onFinish]);

  return (
    <AnimatePresence>
      {!isTypingDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#121212",
            color: "#fff",
            fontSize: "1.8rem",
            fontWeight: "600",
            fontFamily: "'Courier New', Courier, monospace",
            padding: "1rem",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          {displayedText}
          <span className="blink-caret">|</span>
          <style jsx>{`
            .blink-caret {
              animation: blink 1s step-start 0s infinite;
            }
            @keyframes blink {
              50% { opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
