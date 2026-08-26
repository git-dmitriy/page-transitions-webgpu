import {controllerRef} from './app-context.js';

const LERP = 0.2;
const HOVER_SELECTOR = '.page-gallery .slot';

export class Cursor {
    constructor() {
        this.el = document.getElementById('cursor');
        this.x = 0;
        this.y = 0;
        this.tx = 0;
        this.ty = 0;
        this.rafId = null;
        this.hovering = false;
        this.onMove = this.onMove.bind(this);
        this.tick = this.tick.bind(this);
    }

    start() {
        if (!this.el) return;
        window.addEventListener('mousemove', this.onMove);
        this.rafId = requestAnimationFrame(this.tick);
    }

    onMove(e) {
        this.tx = e.clientX;
        this.ty = e.clientY;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        let isHot = !!el?.closest?.(HOVER_SELECTOR);
        if (!isHot) {
            const controller = controllerRef.value;
            if (controller?.current?.page === 'cloud' && controller.indexFloat) {
                isHot = controller.indexFloat.hitAt(e.clientX, e.clientY) !== null;
            }
        }
        if (isHot !== this.hovering) {
            this.hovering = isHot;
            this.el.classList.toggle('is-hover', isHot);
        }
    }

    tick() {
        this.x += (this.tx - this.x) * LERP;
        this.y += (this.ty - this.y) * LERP;
        this.el.style.transform = `translate(${this.x}px, ${this.y}px) translate(-50%, -50%)`;
        this.rafId = requestAnimationFrame(this.tick);
    }
}
