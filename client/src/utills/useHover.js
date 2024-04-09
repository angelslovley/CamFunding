import { useState, useEffect, useRef } from "react";

export default function useHover() {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const enter = () => setHovered(true);
  const leave = () => setHovered(false);

  useEffect(() => {
    let x = ref.current;
    x.addEventListener("mouseenter", enter);
    x.addEventListener("mouseleave", leave);
    return () => {
      x.removeEventListener("mouseenter", enter);
      x.removeEventListener("mouseleave", leave);
    };
  }, [ref]);

  return [ref, hovered];
}
