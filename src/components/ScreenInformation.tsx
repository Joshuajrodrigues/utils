import  { useEffect, useState, useCallback, type ReactElement } from "react";

type InfoRow = {
  key: string;
  value: string;
};

export default function DeviceInfoTable(): ReactElement {
  const [rows, setRows] = useState<InfoRow[]>([]);

  const getInfo = useCallback((): InfoRow[] => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const platform = typeof navigator !== "undefined" ? (navigator.platform || "") : "";

    const prefersDark = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

    const pointerCoarse = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(pointer: coarse)").matches
      : false;

    const anyHover = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(any-hover: hover)").matches
      : false;

    const devicePixelRatio = typeof window !== "undefined" ? String(window.devicePixelRatio) : "";

    const innerW = typeof window !== "undefined" ? String(window.innerWidth) : "";
    const innerH = typeof window !== "undefined" ? String(window.innerHeight) : "";

    const outerW = typeof window !== "undefined" ? String(window.outerWidth) : "";
    const outerH = typeof window !== "undefined" ? String(window.outerHeight) : "";

    const screenW = typeof window !== "undefined" && typeof window.screen !== "undefined" ? String(window.screen.width) : "";
    const screenH = typeof window !== "undefined" && typeof window.screen !== "undefined" ? String(window.screen.height) : "";

    const availW = typeof window !== "undefined" && typeof window.screen !== "undefined" ? String(window.screen.availWidth) : "";
    const availH = typeof window !== "undefined" && typeof window.screen !== "undefined" ? String(window.screen.availHeight) : "";

    const orientation = typeof window !== "undefined" && (window.screen as any)?.orientation?.type
      ? (window.screen as any).orientation.type
      : (typeof window !== "undefined" && (window.orientation !== undefined) ? String((window as any).orientation) : "unknown");

    const rootFontSize = typeof window !== "undefined" ? getComputedStyle(document.documentElement).fontSize : "";

    // visualViewport can be undefined in some envs
    const visualViewport = typeof window !== "undefined" && (window as any).visualViewport
      ? `${(window as any).visualViewport.width}×${(window as any).visualViewport.height}`
      : "n/a";

    const maxTouchPoints = typeof navigator !== "undefined" ? String((navigator as any).maxTouchPoints || 0) : "0";

    const hardwareConcurrency = typeof navigator !== "undefined" ? String((navigator as any).hardwareConcurrency || "n/a") : "n/a";

    const connection = (typeof navigator !== "undefined" && (navigator as any).connection)
      ? JSON.stringify({ effectiveType: (navigator as any).connection.effectiveType, downlink: (navigator as any).connection.downlink }, null, 0)
      : "n/a";

    return [
      { key: "window.innerWidth", value: innerW },
      { key: "window.innerHeight", value: innerH },
      { key: "window.outerWidth", value: outerW },
      { key: "window.outerHeight", value: outerH },
      { key: "window.devicePixelRatio", value: devicePixelRatio },
      { key: "screen.width", value: screenW },
      { key: "screen.height", value: screenH },
      { key: "screen.availWidth", value: availW },
      { key: "screen.availHeight", value: availH },
      { key: "screen.orientation", value: String(orientation) },
      { key: "visualViewport", value: visualViewport },
      { key: "navigator.userAgent", value: ua },
      { key: "navigator.platform", value: platform },
      { key: "navigator.maxTouchPoints", value: maxTouchPoints },
      { key: "prefers-color-scheme: dark", value: String(prefersDark) },
      { key: "pointer: coarse", value: String(pointerCoarse) },
      { key: "any-hover: hover", value: String(anyHover) },
      { key: "root font-size (1rem)", value: rootFontSize },
      { key: "navigator.hardwareConcurrency", value: hardwareConcurrency },
      { key: "navigator.connection (if available)", value: connection },
    ];
  }, []);

  useEffect(() => {
    const update = () => setRows(getInfo());
    update();

    const onResize = () => update();
    const onOrientation = () => update();

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);

    // matchMedia listeners for dynamic prefs
    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    const pointerMq = window.matchMedia("(pointer: coarse)");
    const hoverMq = window.matchMedia("(any-hover: hover)");

    const mqListener = () => update();
    try {
      darkMq.addEventListener?.("change", mqListener)! || darkMq.addListener?.(mqListener) ;
      pointerMq.addEventListener?.("change", mqListener)! || pointerMq.addListener?.(mqListener);
      hoverMq.addEventListener?.("change", mqListener)! || hoverMq.addListener?.(mqListener);
    } catch (e) {
      // ignore in older browsers
    }

    // visualViewport resize
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener("resize", onResize);
      (window as any).visualViewport.addEventListener("scroll", onResize);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      try {
        darkMq.removeEventListener?.("change", mqListener)! || darkMq.removeListener?.(mqListener);
        pointerMq.removeEventListener?.("change", mqListener)! || pointerMq.removeListener?.(mqListener);
        hoverMq.removeEventListener?.("change", mqListener)! || hoverMq.removeListener?.(mqListener);
      } catch (e) {}
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener("resize", onResize);
        (window as any).visualViewport.removeEventListener("scroll", onResize);
      }
    };
  }, [getInfo]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // optional: small visual feedback could be added
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Display & Window Info</h3>
        <div className="text-sm text-muted-foreground">Live values — updates on resize/orientation</div>
      </div>

      <div className="overflow-auto rounded-lg border">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left">Property</th>
              <th className="px-3 py-2 text-left">Value</th>
              <th className="px-3 py-2">Copy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="odd:bg-white even:bg-gray-100 align-top">
                <td className="px-3 py-2 align-top font-medium w-1/3">{r.key}</td>
                <td className="px-3 py-2 align-top break-words max-w-xl">{r.value}</td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => copy(r.value)}
                    className="px-2 py-1 rounded border text-sm hover:bg-gray-100"
                    title={`Copy ${r.key}`}
                  >
                    Copy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
