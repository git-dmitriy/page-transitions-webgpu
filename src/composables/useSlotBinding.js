export function useSlotBinding(gpu, planeIndexFn) {
    function bindSlot(index, el) {
        if (!el) return;
        const plane = gpu.planes[planeIndexFn(index)];
        plane.trackedEl = el;
        const rect = el.getBoundingClientRect();
        plane.bounds.x = rect.left;
        plane.bounds.y = rect.top;
        plane.bounds.w = rect.width;
        plane.bounds.h = rect.height;
    }

    return {bindSlot};
}
