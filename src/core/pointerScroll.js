const CLICK_THRESHOLD = 5;
const IGNORE_CLOSEST = "#nav, #footer, .theme-toggle, .case-detail";

export function bindPointerScroll(onDelta) {
    let pointerActive = false;
    let isDragging = false;
    let didDrag = false;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;
    let preventClick = null;

    function clearClickGuard() {
        if (!preventClick) return;
        window.removeEventListener("click", preventClick, true);
        preventClick = null;
    }

    function armClickGuard() {
        clearClickGuard();
        preventClick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            clearClickGuard();
        };
        window.addEventListener("click", preventClick, true);
        window.setTimeout(clearClickGuard, 50);
    }

    function onDown(e) {
        if (e.isPrimary === false) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (e.target?.closest?.(IGNORE_CLOSEST)) return;
        pointerActive = true;
        isDragging = true;
        didDrag = false;
        downX = lastX = e.clientX;
        downY = lastY = e.clientY;
    }

    function onMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        const dist = (e.clientX - downX) ** 2 + (e.clientY - downY) ** 2;
        if (dist > CLICK_THRESHOLD * CLICK_THRESHOLD) didDrag = true;
        if (!didDrag) return;
        e.preventDefault();
        onDelta(dx, dy);
    }

    function onUp() {
        if (!pointerActive) return;
        pointerActive = false;
        isDragging = false;
        if (didDrag) armClickGuard();
    }

    function start() {
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove, {passive: false});
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    }

    function stop() {
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        pointerActive = false;
        isDragging = false;
        didDrag = false;
        clearClickGuard();
    }

    return {start, stop};
}
