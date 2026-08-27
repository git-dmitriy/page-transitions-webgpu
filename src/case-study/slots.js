export const CASE_STUDY_SLOT_COUNT = 5;
export const CASE_STUDY_PRIMARY_SLOT = Math.floor(CASE_STUDY_SLOT_COUNT / 2);

export function innerSatelliteSlotIndices() {
    const indices = [];
    for (let i = 0; i < CASE_STUDY_SLOT_COUNT; i++) {
        if (i !== CASE_STUDY_PRIMARY_SLOT) indices.push(i);
    }
    return indices;
}

export function planeIndexForInnerSlot(slotIndex, imageIndex, mainIdxFn, satIdxFn) {
    if (slotIndex === CASE_STUDY_PRIMARY_SLOT) return mainIdxFn(imageIndex);
    const j = innerSatelliteSlotIndices().indexOf(slotIndex);
    return satIdxFn(imageIndex, j);
}
