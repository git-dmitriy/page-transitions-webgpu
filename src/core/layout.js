import {
    CASE_STUDY_PRIMARY_SLOT,
    innerSatelliteSlotIndices,
} from '../case-study/slots.js';

export function getMainTargets(rootEl) {
    const slots = rootEl.querySelectorAll('.slot');
    const rects = [];
    for (let i = 0; i < slots.length; i++) {
        const r = slots[i].getBoundingClientRect();
        rects.push({x: r.left, y: r.top, w: r.width, h: r.height});
    }
    return rects;
}

export function getInnerTargets(rootEl) {
    const slots = rootEl.querySelectorAll('.case-scroll .slot');
    const rects = [];
    for (let i = 0; i < slots.length; i++) {
        const r = slots[i].getBoundingClientRect();
        rects.push({x: r.left, y: r.top, w: r.width, h: r.height});
    }
    return rects;
}

export function getInnerPrimaryTarget(rootEl) {
    return getInnerTargets(rootEl)[CASE_STUDY_PRIMARY_SLOT] ?? null;
}

export function getInnerSatelliteTargets(rootEl) {
    const rects = getInnerTargets(rootEl);
    return innerSatelliteSlotIndices().map((i) => rects[i]).filter(Boolean);
}
