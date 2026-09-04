import gsap from 'gsap'

export const DUR_MORPH = 0.9;
export const DUR_FADE = 0.5;
export const EASE_MORPH = 'power3.inOut';
export const EASE_FADE = 'power2.out';
export const EASE_FADE_OUT = 'power2.in';

export function setBounds(plane, target) {
    plane.bounds.x = target.x;
    plane.bounds.y = target.y;
    plane.bounds.w = target.w;
    plane.bounds.h = target.h;
    plane.bounds.z = target.z ?? 0;
}

export function tweenBounds(plane, target, opts = {}) {
    if (target.z != null) plane.bounds.z = target.z;
    return gsap.to(plane.bounds, {
        x: target.x,
        y: target.y,
        w: target.w,
        h: target.h,
        duration: opts.duration ?? DUR_MORPH,
        ease: opts.ease ?? EASE_MORPH,
        delay: opts.delay ?? 0,
    });
}

export function tweenOpacity(plane, to, opts = {}) {
    return gsap.to(plane, {
        opacity: to,
        duration: opts.duration ?? DUR_FADE,
        ease: opts.ease ?? EASE_FADE,
        delay: opts.delay ?? 0,
    });
}
