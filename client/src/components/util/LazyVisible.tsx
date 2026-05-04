import { ReactNode, useEffect, useRef, useState } from "react";

interface LazyVisibleProps {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: number | string;
}

export function LazyVisible({ children, rootMargin = "300px", minHeight = 200 }: LazyVisibleProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={!show ? { minHeight } : undefined}>
      {show ? children : null}
    </div>
  );
}
