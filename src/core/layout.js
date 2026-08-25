export function getMainTargets(rootEl) {
    const slots = rootEl.querySelectorAll('.slot');
    const rects = [];
    for (let i = 0; i < slots.length; i++) {
        const r = slots[i].getBoundingClientRect();
        rects.push({x: r.left, y: r.top, w: r.width, h: r.height});
    }
    return rects;
}
