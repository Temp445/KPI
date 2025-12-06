"use client";

import { useCallback, useRef, useState } from "react";

export default function useFullscreen() {
    const elementRef = useRef<HTMLDivElement | null>(null);
      const [fullscreen, setFullscreen] = useState(false);


    const enter = useCallback(() => {
        const el = elementRef.current;
        if (el?.requestFullscreen) el.requestFullscreen();
         setFullscreen(true);
    }, []);

    const exit = useCallback(() => {
         if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreen(false);
         }
    }, []);

   
  const toggle = useCallback(() => {
    if (fullscreen) {
      exit();
    } else {
      enter();
    }
  }, [fullscreen, enter, exit]);

    return { elementRef, enter, exit, toggle, fullscreen };
}
