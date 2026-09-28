import React, { useEffect, useState, useRef } from "react";
import { useInView } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.5,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;

      setDisplayValue(current);

      if (frame >= totalFrames) {
        clearInterval(counter);
        setDisplayValue(end);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [isInView, value, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
