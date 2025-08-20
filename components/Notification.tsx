import React, { useEffect, useState } from "react";
import styles from "./Notification.module.css";

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Notification({ message, onClose, duration = 3000 }: NotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500); // Wait for fade-out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.notification} ${show ? styles.show : styles.hide}`}>
      {message}
    </div>
  );
}
