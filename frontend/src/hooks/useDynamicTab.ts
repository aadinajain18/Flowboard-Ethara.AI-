import { useEffect, useRef } from "react";

const ORIGINAL_TITLE = "FlowBoard — Team Task Manager";
const FAVICON_SIZE = 32;
const BADGE_RADIUS = 7;

/**
 * Dynamically updates the browser tab title and favicon
 * based on unread notification count.
 *
 * - Shows "({count}) FlowBoard" in the tab title
 * - Draws a red notification dot on the favicon
 * - Blinks the tab title when new notifications arrive while tab is hidden
 */
export function useDynamicTab(unreadCount: number) {
  const blinkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(unreadCount);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── Update tab title ──────────────────────────────────
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${ORIGINAL_TITLE}`;
    } else {
      document.title = ORIGINAL_TITLE;
    }

    return () => {
      document.title = ORIGINAL_TITLE;
    };
  }, [unreadCount]);

  // ── Blink title when new notifications arrive on hidden tab ──
  useEffect(() => {
    if (unreadCount > prevCountRef.current && document.hidden) {
      // New notification while tab is not focused — blink
      if (blinkRef.current) clearInterval(blinkRef.current);

      let showAlert = true;
      blinkRef.current = setInterval(() => {
        document.title = showAlert
          ? `🔔 New notification!`
          : `(${unreadCount}) ${ORIGINAL_TITLE}`;
        showAlert = !showAlert;
      }, 1200);

      const stopBlink = () => {
        if (blinkRef.current) {
          clearInterval(blinkRef.current);
          blinkRef.current = null;
        }
        document.title =
          unreadCount > 0 ? `(${unreadCount}) ${ORIGINAL_TITLE}` : ORIGINAL_TITLE;
      };

      document.addEventListener("visibilitychange", stopBlink, { once: true });
      window.addEventListener("focus", stopBlink, { once: true });
    }

    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // ── Dynamic favicon with badge ────────────────────────
  useEffect(() => {
    const link: HTMLLinkElement =
      document.querySelector('link[rel="icon"]') ||
      (() => {
        const el = document.createElement("link");
        el.rel = "icon";
        document.head.appendChild(el);
        return el;
      })();

    // Store original favicon src on first run
    const originalHref = link.getAttribute("data-original-href") || link.href;
    if (!link.getAttribute("data-original-href")) {
      link.setAttribute("data-original-href", originalHref);
    }

    if (unreadCount === 0) {
      // Restore original favicon
      link.href = originalHref;
      return;
    }

    // Create canvas to draw badge on favicon
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = FAVICON_SIZE;
      canvasRef.current.height = FAVICON_SIZE;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, FAVICON_SIZE, FAVICON_SIZE);
      ctx.drawImage(img, 0, 0, FAVICON_SIZE, FAVICON_SIZE);

      // Draw red badge circle
      ctx.beginPath();
      ctx.arc(
        FAVICON_SIZE - BADGE_RADIUS,
        BADGE_RADIUS,
        BADGE_RADIUS,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#C75050";
      ctx.fill();

      // Draw count text
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${BADGE_RADIUS * 1.4}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayCount = unreadCount > 9 ? "9+" : String(unreadCount);
      ctx.fillText(
        displayCount,
        FAVICON_SIZE - BADGE_RADIUS,
        BADGE_RADIUS + 0.5
      );

      link.href = canvas.toDataURL("image/png");
    };

    img.src = originalHref || "/vite.svg";
  }, [unreadCount]);
}
