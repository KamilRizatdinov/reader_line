// Reader Line content script.
//
// Runs in every frame. Only the top frame draws the line; nested frames
// report the cursor position to their parent via postMessage, and every
// frame translates it into its own viewport and passes it further up.
(() => {
  // The script may be injected twice (manifest + background after install);
  // the second run must do nothing while the first copy is alive.
  const previous = globalThis.__readerLine;
  if (previous && !previous.isOrphaned()) return;
  if (previous) previous.teardown();
  globalThis.__readerLine = { isOrphaned, teardown };

  const MESSAGE_TYPE = "reader-line:pointer";
  const HOST_TAG = "reader-line-root";
  const LEGACY_CLASS = "cmVhZGVyLWxpbmU"; // element of versions <= 1.0.4
  const DEFAULTS = { color: "rgba(0, 0, 0, 0.15)", height: 20, enabled: false, mode: "line" };

  const isTop = window === window.top;
  let settings = { ...DEFAULTS };
  let alive = true;

  // After the extension is updated or reloaded, the old copy of this script
  // stays in open tabs without access to chrome.* — it has to step aside.
  function isOrphaned() {
    try {
      return !chrome.runtime?.id;
    } catch (e) {
      return true;
    }
  }

  // ---------- Drawing (top frame only) ----------

  const STYLE = `
    .line {
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 20px;
      margin: 0;
      padding: 0;
      border: 0;
      pointer-events: none;
      display: none;
      background-color: var(--line-color);
      will-change: transform;
    }
    .line.visible { display: block; }
    .line.focus { background-color: transparent; }
    .line.focus::before,
    .line.focus::after {
      content: "";
      position: absolute;
      left: 0;
      width: 100%;
      height: 100vh;
      background-color: var(--line-color);
    }
    .line.focus::before { bottom: 100%; }
    .line.focus::after { top: 100%; }
  `;

  const HOST_STYLE = [
    "all: initial !important",
    "display: block !important",
    "position: fixed !important",
    "top: 0 !important",
    "left: 0 !important",
    "width: 0 !important",
    "height: 0 !important",
    "overflow: visible !important",
    "z-index: 2147483647 !important",
    "pointer-events: none !important",
  ].join("; ");

  let host = null;
  let line = null;
  let observer = null;
  let lastY = null;
  let frameRequested = false;

  function mount() {
    // Leftovers of an outdated copy of the extension in this tab.
    document.querySelectorAll(`.${LEGACY_CLASS}, ${HOST_TAG}`).forEach((el) => el.remove());

    host = document.createElement(HOST_TAG);
    host.setAttribute("style", HOST_STYLE);
    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    line = document.createElement("div");
    line.className = "line";
    shadow.append(style, line);
    attachHost();

    // Pages that rebuild their DOM may throw our element away — put it back.
    // Watching only <html> children (and <html> itself) keeps this cheap.
    observer = new MutationObserver(() => {
      if (isOrphaned()) return teardown();
      if (!host.isConnected) attachHost();
      observeRoot();
    });
    observeRoot();
  }

  let observedRoot = null;
  function observeRoot() {
    const root = document.documentElement;
    if (observedRoot === root) return;
    observedRoot = root;
    observer.observe(document, { childList: true });
    if (root) observer.observe(root, { childList: true });
  }

  function attachHost() {
    const root = document.documentElement;
    if (root) root.appendChild(host);
  }

  function render() {
    if (!line) return;
    line.style.setProperty("--line-color", settings.color);
    line.style.height = settings.height + "px";
    line.classList.toggle("visible", !!settings.enabled);
    line.classList.toggle("focus", settings.mode === "focus");
    if (lastY !== null) placeLine();
  }

  function placeLine() {
    frameRequested = false;
    if (!line || lastY === null) return;
    const top = lastY - settings.height / 2;
    line.style.transform = `translateY(${top}px)`;
  }

  function moveTo(y) {
    lastY = y;
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(placeLine);
    }
  }

  // ---------- Cursor tracking (every frame) ----------

  function report(y) {
    if (!settings.enabled) return;
    if (isTop) {
      moveTo(y);
    } else {
      window.parent.postMessage({ type: MESSAGE_TYPE, y }, "*");
    }
  }

  function onMouseMove(e) {
    if (isOrphaned()) return teardown();
    report(e.clientY);
  }

  // Find the <iframe>/<frame> element whose window sent the message.
  const frameCache = new WeakMap();
  function findFrame(source) {
    const cached = frameCache.get(source);
    if (cached && cached.isConnected && cached.contentWindow === source) return cached;
    const frame = searchFrames(document, source);
    if (frame) frameCache.set(source, frame);
    return frame;
  }

  function searchFrames(root, source) {
    for (const frame of root.querySelectorAll("iframe, frame")) {
      if (frame.contentWindow === source) return frame;
    }
    // Frames inside open shadow roots (web components).
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) {
        const found = searchFrames(el.shadowRoot, source);
        if (found) return found;
      }
    }
    return null;
  }

  function onMessage(e) {
    const data = e.data;
    if (!data || typeof data !== "object" || data.type !== MESSAGE_TYPE) return;
    if (typeof data.y !== "number" || !Number.isFinite(data.y)) return;
    if (!e.source || e.source === window) return;
    if (isOrphaned()) return teardown();

    const frame = findFrame(e.source);
    if (!frame) return; // not one of our child frames

    // Convert the y coordinate from the child's viewport into ours, taking
    // border, padding and CSS scaling of the frame element into account.
    const rect = frame.getBoundingClientRect();
    const scale = frame.offsetHeight ? rect.height / frame.offsetHeight : 1;
    const paddingTop = parseFloat(getComputedStyle(frame).paddingTop) || 0;
    const y = rect.top + (frame.clientTop + paddingTop + data.y) * scale;
    report(y);
  }

  // ---------- Settings ----------

  function loadSettings() {
    chrome.storage.local.get(Object.keys(DEFAULTS)).then((result) => {
      settings = { ...DEFAULTS };
      for (const key of Object.keys(DEFAULTS)) {
        if (result[key] !== undefined) settings[key] = result[key];
      }
      render();
    });
  }

  function onStorageChanged(changes, namespace) {
    if (namespace === "local") loadSettings();
  }

  // ---------- Lifecycle ----------

  function teardown() {
    if (!alive) return;
    alive = false;
    window.removeEventListener("mousemove", onMouseMove, true);
    window.removeEventListener("message", onMessage);
    if (observer) observer.disconnect();
    if (host) host.remove();
    try {
      chrome.storage.onChanged.removeListener(onStorageChanged);
    } catch (e) {
      // extension context is already gone
    }
  }

  if (isTop) mount();
  window.addEventListener("mousemove", onMouseMove, { capture: true, passive: true });
  window.addEventListener("message", onMessage);
  chrome.storage.onChanged.addListener(onStorageChanged);
  loadSettings();
})();
