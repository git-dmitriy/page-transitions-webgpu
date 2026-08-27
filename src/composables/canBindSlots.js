import {controllerRef} from '../app-context.js';

export function canBindSlots() {
    const controller = controllerRef.value;
    if (!controller) return true;
    if (controller.mutating) return false;
    const detailState = controller.caseStudy?.detail?.state;
    if (detailState && detailState !== 'closed') return false;
    return true;
}
