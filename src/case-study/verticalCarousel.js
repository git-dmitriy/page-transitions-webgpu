import {bindPointerScroll} from "../core/pointerScroll.js";

const LERP = 0.1;
const GAP_PX = 48;

export class VerticalCarousel {
    constructor(rootEl) {
        this.slots = Array.from(rootEl.querySelectorAll(".slot"));
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.cellH = 0;
        this.stepY = 0;
        this.periodY = 0;
        this.velocity = 0;
        this.active = false;
        this.onWheel = this.onWheel.bind(this);
        this._pointer = bindPointerScroll((dx, dy) => {
            this.targetScrollY -= Math.abs(dx) > Math.abs(dy) ? dx : dy;
        });
    }

    resetScroll() {
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.velocity = 0;
    }

    settle() {
        this.targetScrollY = this.scrollY;
        this.velocity = 0;
        this.applyTransforms();
    }

    prepare() {
        this.resetScroll();
        this.measure();
        void this.slots[0]?.offsetHeight;
        this.applyTransforms();
    }

    start() {
        this.prepare();
        this.resume();
    }

    resume() {
        this.stop();
        this.measure();
        this.applyTransforms();
        this.active = true;
        window.addEventListener("wheel", this.onWheel, {
            capture: true,
            passive: false,
        });
        this._pointer.start();
    }

    stop() {
        this.active = false;
        window.removeEventListener("wheel", this.onWheel, {capture: true});
        this._pointer.stop();
    }

    measure() {
        this.cellH = this.slots[0]?.offsetHeight ?? 0;
        this.stepY = this.cellH + GAP_PX;
        this.periodY = this.slots.length * this.stepY;
    }

    onWheel(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const delta =
            Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        this.targetScrollY += delta;
    }

    applyTransforms() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const half = this.periodY / 2;
        const c = Math.floor(this.slots.length / 2);
        for (let i = 0; i < this.slots.length; i++) {
            let relY = (i - c) * this.stepY - this.scrollY;
            relY = ((relY % this.periodY) + this.periodY) % this.periodY;
            if (relY >= half) relY -= this.periodY;
            const cellW = this.slots[i].offsetWidth;
            const cellH = this.slots[i].offsetHeight;
            const stagger =
                parseFloat(
                    getComputedStyle(this.slots[i]).getPropertyValue("--stagger"),
                ) || 0;
            const staggerPx = (stagger / 100) * vw;
            const x = vw / 2 + staggerPx - cellW / 2;
            const y = vh / 2 + relY - cellH / 2;
            this.slots[i].style.transform = `translate(${x}px, ${y}px)`;
        }
    }

    tick() {
        if (!this.active) return;
        const prev = this.scrollY;
        this.scrollY += (this.targetScrollY - this.scrollY) * LERP;
        this.velocity = this.scrollY - prev;
        this.applyTransforms();
    }
}
