import gsap from "gsap";
import {SATELLITES_PER_IMAGE} from "../gpu.js";
import {planeIndexForInnerSlot} from "./slots.js";
import {DUR_FADE, DUR_MORPH, EASE_FADE, EASE_MORPH} from "../transitions/constants.js";

export class CaseStudyDetail {
    constructor({gpu, imageIndex, root, mainIdx, satIdx}) {
        this.gpu = gpu;
        this.imageIndex = imageIndex;
        this.root = root;
        this.mainIdx = mainIdx;
        this.satIdx = satIdx;
        this.state = "closed";
        this.activeSlotIndex = null;
        this.activePlane = null;
        this.tl = null;
        this._done = null;
        this._resolveDone = null;

        this.panel = root.querySelector(".case-detail");
        this.backBtn = root.querySelector(".case-detail__back");
        this.titleEl = root.querySelector(".case-detail__title");
        this.bodyEl = root.querySelector(".case-detail__body");
        this.copyEls = [this.backBtn, this.titleEl, this.bodyEl];

        this.onClose = null;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onBackClick = () => this.close();
        this.backBtn?.addEventListener("click", this.onBackClick);
    }

    slotCount() {
        return SATELLITES_PER_IMAGE + 1;
    }

    planeForSlot(slotIndex) {
        const idx = planeIndexForInnerSlot(
            slotIndex,
            this.imageIndex,
            this.mainIdx,
            this.satIdx,
        );
        return this.gpu.planes[idx];
    }

    slotEl(slotIndex) {
        return this.root.querySelectorAll(".case-scroll .slot")[slotIndex];
    }

    leftHalfRect() {
        return {
            x: 0,
            y: 0,
            w: window.innerWidth / 2,
            h: window.innerHeight,
            z: 0,
        };
    }

    killPlaneTweens() {
        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            if (!plane) continue;
            gsap.killTweensOf(plane);
            gsap.killTweensOf(plane.bounds);
        }
    }

    snapPlanesToSlots() {
        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            const slot = this.slotEl(i);
            if (!plane || !slot) continue;
            const r = slot.getBoundingClientRect();
            plane.bounds.x = r.left;
            plane.bounds.y = r.top;
            plane.bounds.w = r.width;
            plane.bounds.h = r.height;
            plane.bounds.z = 0;
        }
    }

    detachPlanes() {
        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            if (plane) plane.trackedEl = null;
        }
    }

    rebindSlots() {
        this.snapPlanesToSlots();
        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            const slot = this.slotEl(i);
            if (plane && slot) {
                plane.opacity = 1;
                plane.trackedEl = slot;
            }
        }
    }

    _trackDone() {
        this._done = new Promise((resolve) => {
            this._resolveDone = resolve;
        });
        return this._done;
    }

    _finishDone() {
        this._resolveDone?.();
        this._resolveDone = null;
        this._done = null;
    }

    finishClosed({notify = true} = {}) {
        this.tl = null;
        gsap.set(this.panel, {display: "none"});
        gsap.set(this.copyEls, {clearProps: "opacity,visibility"});
        this.rebindSlots();
        this.activeSlotIndex = null;
        this.activePlane = null;
        this.state = "closed";
        window.removeEventListener("keydown", this.onKeyDown);
        this._finishDone();
        if (notify) this.onClose?.();
    }

    async open(slotIndex) {
        if (this.state !== "closed") return;
        this.state = "opening";
        this.activeSlotIndex = slotIndex;
        this.activePlane = this.planeForSlot(slotIndex);
        const slot = this.slotEl(slotIndex);
        if (!slot || !this.activePlane) {
            this.state = "closed";
            return;
        }

        this.detachPlanes();

        const target = this.leftHalfRect();
        if (target.z != null) this.activePlane.bounds.z = target.z;

        gsap.set(this.panel, {display: "block", autoAlpha: 0});
        gsap.set(this.copyEls, {autoAlpha: 0});

        window.addEventListener("keydown", this.onKeyDown);

        const done = this._trackDone();

        this.tl = gsap.timeline({
            onComplete: () => {
                this.state = "open";
                this.tl = null;
                this._finishDone();
            },
        });

        this.tl.to(
            this.activePlane.bounds,
            {
                x: target.x,
                y: target.y,
                w: target.w,
                h: target.h,
                duration: DUR_MORPH,
                ease: EASE_MORPH,
            },
            0,
        );

        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            if (plane === this.activePlane) continue;
            this.tl.to(
                plane,
                {opacity: 0, duration: DUR_FADE, ease: EASE_FADE},
                0,
            );
        }

        this.tl.to(
            this.panel,
            {autoAlpha: 1, duration: 0.4, ease: "power2.out"},
            0.4,
        );
        this.tl.to(
            this.copyEls,
            {
                autoAlpha: 1,
                duration: 0.8,
                stagger: 0.08,
                ease: "power3.out",
            },
            0.55,
        );

        await done;
    }

    async close({notify = true} = {}) {
        if (this.state === "closing") return this._done ?? Promise.resolve();

        if (this.state === "opening" && this.tl) {
            this.state = "closing";
            const done = this._done ?? this._trackDone();
            this.tl.eventCallback("onReverseComplete", () => {
                this.finishClosed({notify});
            });
            this.tl.reverse();
            return done;
        }

        if (this.state !== "open") return;

        this.state = "closing";
        const done = this._trackDone();

        const slot = this.slotEl(this.activeSlotIndex);
        const rect = slot.getBoundingClientRect();
        const target = {
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height,
            z: 0,
        };
        if (this.activePlane) this.activePlane.bounds.z = 0;

        this.tl = gsap.timeline({
            onComplete: () => {
                this.finishClosed({notify});
            },
        });

        this.tl.to(
            this.activePlane.bounds,
            {
                x: target.x,
                y: target.y,
                w: target.w,
                h: target.h,
                duration: DUR_MORPH,
                ease: EASE_MORPH,
            },
            0,
        );

        this.tl.to(
            this.copyEls,
            {
                autoAlpha: 0,
                duration: 0.35,
                stagger: 0.04,
                ease: "power1.out",
            },
            0,
        );
        this.tl.to(
            this.panel,
            {autoAlpha: 0, duration: 0.35, ease: "power2.in"},
            0,
        );

        for (let i = 0; i < this.slotCount(); i++) {
            if (i === this.activeSlotIndex) continue;
            const plane = this.planeForSlot(i);
            this.tl.to(
                plane,
                {
                    opacity: 1,
                    duration: DUR_FADE,
                    ease: EASE_FADE,
                    delay: 0.35,
                },
                0,
            );
        }

        return done;
    }

    async waitUntilClosed() {
        if (this.state === "closed") return;
        if (this.state === "closing") return this._done ?? Promise.resolve();
        await this.close({notify: false});
    }

    forceClose() {
        if (this.tl) {
            this.tl.kill();
            this.tl = null;
        }
        gsap.killTweensOf(this.copyEls);
        gsap.killTweensOf(this.panel);
        this.killPlaneTweens();
        gsap.set(this.panel, {display: "none"});
        gsap.set(this.copyEls, {clearProps: "opacity,visibility"});
        this.rebindSlots();
        this.activeSlotIndex = null;
        this.activePlane = null;
        this.state = "closed";
        window.removeEventListener("keydown", this.onKeyDown);
        this._finishDone();
    }

    abortForLeave() {
        if (this.state === "closed") return null;

        const hero =
            this.activePlane != null
                ? {
                    x: this.activePlane.bounds.x,
                    y: this.activePlane.bounds.y,
                    w: this.activePlane.bounds.w,
                    h: this.activePlane.bounds.h,
                    z: 0,
                }
                : this.leftHalfRect();

        if (this.tl) {
            this.tl.kill();
            this.tl = null;
        }
        gsap.killTweensOf(this.copyEls);
        gsap.killTweensOf(this.panel);
        this.killPlaneTweens();
        gsap.set(this.panel, {display: "none"});
        gsap.set(this.copyEls, {clearProps: "opacity,visibility"});
        this.detachPlanes();
        this.activeSlotIndex = null;
        this.activePlane = null;
        this.state = "closed";
        window.removeEventListener("keydown", this.onKeyDown);
        this._finishDone();
        return hero;
    }

    onKeyDown(e) {
        if (e.key === "Escape") this.close();
    }

    destroy() {
        this.backBtn?.removeEventListener("click", this.onBackClick);
        this.onClose = null;
        if (this.state !== "closed") this.forceClose();
        else window.removeEventListener("keydown", this.onKeyDown);
    }
}
