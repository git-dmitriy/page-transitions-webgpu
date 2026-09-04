import {
    MAIN_COUNT,
    SATELLITES_PER_IMAGE,
    mainIdx,
    satIdx,
} from '../gpu.js';
import {getInnerPrimaryTarget, getInnerSatelliteTargets} from '../core/layout.js';
import {tweenBounds, tweenOpacity, setBounds} from './constants.js';

export class MainToInnerTransition {
    async out(_from, toEl, ctx) {
        const {gpu, toImage} = ctx;
        const target = getInnerPrimaryTarget(toEl);
        if (!target) return;
        const tweens = [];
        for (let i = 0; i < MAIN_COUNT; i++) {
            const plane = gpu.planes[mainIdx(i)];
            if (i === toImage) {
                tweens.push(tweenBounds(plane, target));
                continue;
            }
            tweens.push(tweenOpacity(plane, 0));
        }
        await Promise.all(tweens);
    }

    async in(_from, toEl, ctx) {
        const {gpu, toImage} = ctx;
        const satTargets = getInnerSatelliteTargets(toEl);
        const fades = [];
        for (let j = 0; j < SATELLITES_PER_IMAGE; j++) {
            const slot = satTargets[j];
            if (!slot) continue;
            const sat = gpu.planes[satIdx(toImage, j)];
            setBounds(sat, slot);
            sat.opacity = 0;
            fades.push(
                tweenOpacity(sat, 1, {
                    delay: 0.25 + j * 0.08,
                }),
            );
        }
        await Promise.all(fades);
    }
}
