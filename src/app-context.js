import {shallowRef} from 'vue';
import {createPageStack} from './composables/usePageStack.js';

export const controllerRef = shallowRef(null);
export const pageStack = createPageStack();
