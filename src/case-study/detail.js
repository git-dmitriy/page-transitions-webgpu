import gsap from "gsap";
import {SATELLITES_PER_IMAGE} from "../gpu.js";
import {planeIndexForInnerSlot} from "./slots.js";
import {DUR_FADE, EASE_FADE, tweenBounds, tweenOpacity} from "../transitions/constants.js";

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
        this.running = null;

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

    restorePlanes() {
        this.killPlaneTweens();
        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            if (plane) plane.opacity = 1;
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

        gsap.set(this.panel, {display: "block", autoAlpha: 0});
        gsap.set(this.copyEls, {autoAlpha: 0});

        const tweens = [
            tweenBounds(this.activePlane, this.leftHalfRect()),
            gsap.to(this.panel, {
                autoAlpha: 1,
                duration: 0.4,
                ease: "power2.out",
                delay: 0.4,
            }),
            gsap.to(this.copyEls, {
                autoAlpha: 1,
                duration: 0.8,
                stagger: 0.08,
                ease: "power3.out",
                delay: 0.55,
            }),
        ];

        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            if (plane === this.activePlane) continue;
            tweens.push(tweenOpacity(plane, 0, {duration: DUR_FADE, ease: EASE_FADE}));
        }

        window.addEventListener("keydown", this.onKeyDown);

        this.running = Promise.all(tweens);
        try {
            await this.running;
            this.state = "open";
        } catch {
            await this.reset();
        } finally {
            this.running = null;
        }
    }

    async close({notify = true} = {}) {
        if (this.state === "opening" || this.state === "closing") {
            gsap.killTweensOf(this.copyEls);
            gsap.killTweensOf(this.panel);
            this.running = null;
            await this.reset({notify});
            return;
        }

        if (this.state !== "open") return;
        this.state = "closing";

        const slot = this.slotEl(this.activeSlotIndex);
        const rect = slot.getBoundingClientRect();
        const target = {
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height,
            z: 0,
        };

        const tweens = [
            tweenBounds(this.activePlane, target),
            gsap.to(this.copyEls, {
                autoAlpha: 0,
                duration: 0.35,
                stagger: 0.04,
                ease: "power1.out",
            }),
            gsap.to(this.panel, {
                autoAlpha: 0,
                duration: 0.35,
                ease: "power2.in",
            }),
        ];

        for (let i = 0; i < this.slotCount(); i++) {
            if (i === this.activeSlotIndex) continue;
            const plane = this.planeForSlot(i);
            tweens.push(tweenOpacity(plane, 1, {delay: 0.35, duration: DUR_FADE, ease: EASE_FADE}));
        }

        this.running = Promise.all(tweens);
        try {
            await this.running;
        } finally {
            this.running = null;
            await this.reset({notify});
        }
    }

    forceClose() {
        gsap.killTweensOf(this.copyEls);
        gsap.killTweensOf(this.panel);
        this.running = null;
        this.restorePlanes();
        gsap.set(this.panel, {display: "none"});
        gsap.set(this.copyEls, {clearProps: "opacity,visibility"});
        this.rebindSlots();
        this.activeSlotIndex = null;
        this.activePlane = null;
        this.state = "closed";
        window.removeEventListener("keydown", this.onKeyDown);
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

        gsap.killTweensOf(this.copyEls);
        gsap.killTweensOf(this.panel);
        this.killPlaneTweens();
        this.running = null;
        gsap.set(this.panel, {display: "none"});
        gsap.set(this.copyEls, {clearProps: "opacity,visibility"});
        this.detachPlanes();
        this.activeSlotIndex = null;
        this.activePlane = null;
        this.state = "closed";
        window.removeEventListener("keydown", this.onKeyDown);
        return hero;
    }

    async reset({notify = true} = {}) {
        this.restorePlanes();
        gsap.set(this.panel, {display: "none"});
        gsap.set(this.copyEls, {clearProps: "opacity,visibility"});

        this.rebindSlots();

        this.activeSlotIndex = null;
        this.activePlane = null;
        this.state = "closed";

        window.removeEventListener("keydown", this.onKeyDown);
        if (notify) this.onClose?.();
    }

    rebindSlots() {
        this.snapPlanesToSlots();
        for (let i = 0; i < this.slotCount(); i++) {
            const plane = this.planeForSlot(i);
            const slot = this.slotEl(i);
            if (plane && slot) plane.trackedEl = slot;
        }
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
