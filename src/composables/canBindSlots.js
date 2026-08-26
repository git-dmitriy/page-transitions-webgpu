import {controllerRef} from '../app-context.js';

export function canBindSlots() {
    return !controllerRef.value?.mutating;
}
