import {
    MAIN_COUNT,
    SATELLITES_PER_IMAGE,
    mainIdx,
    satIdx,
} from '../gpu.js';
import {getInnerPrimaryTarget, getInnerSatelliteTargets} from '../core/layout.js';
import {
    tweenBounds,
    tweenOpacity,
    DUR_FADE,
    EASE_FADE_OUT,
} from './constants.js';

export class IndexToInnerTransition {
    async out(_from, toEl, ctx) {
        const {gpu, toImage} = ctx;
        const target = getInnerPrimaryTarget(toEl);
        if (!target) return;
        const tweens = [];
        tweens.push(tweenBounds(gpu.planes[mainIdx(toImage)], target));
        for (let i = 0; i < MAIN_COUNT; i++) {
            if (i === toImage) continue;
            tweens.push(
                tweenOpacity(gpu.planes[mainIdx(i)], 0, {
                    duration: DUR_FADE * 0.7,
                    ease: EASE_FADE_OUT,
                }),
            );
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
            sat.bounds = {...slot};
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
