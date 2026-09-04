import {VerticalCarousel} from "./verticalCarousel.js";
import {CaseStudyDetail} from "./detail.js";
import {mainIdx, satIdx, SATELLITES_PER_IMAGE} from "../gpu.js";
import {CASE_STUDY_PRIMARY_SLOT, CASE_STUDY_SLOT_COUNT} from "./slots.js";
import {controllerRef} from "../app-context.js";

export {
    CASE_STUDY_SLOT_COUNT, CASE_STUDY_PRIMARY_SLOT, innerSatelliteSlotIndices, planeIndexForInnerSlot
} from "./slots.js";

export function createCaseStudy({root, gpu, project}) {
    const scrollRoot = root.querySelector(".case-scroll");
    const carousel = new VerticalCarousel(scrollRoot);
    const detail = new CaseStudyDetail({
        gpu,
        imageIndex: project.index,
        root,
        mainIdx,
        satIdx,
    });

    let active = false;

    function resumeCarousel() {
        if (!active) return;
        carousel.resume();
    }

    function canOpenDetail() {
        if (detail.state !== "closed") return false;
        const controller = controllerRef.value;
        if (!controller) return true;
        if (controller.mutating) return false;
        if (!controller.introDone) return false;
        return true;
    }

    detail.onClose = resumeCarousel;

    carousel.prepare();

    const slots = root.querySelectorAll(".case-scroll .slot");
    for (let i = 0; i < slots.length; i++) {
        const slotIndex = i;
        slots[i].tabIndex = 0;
        slots[i].setAttribute("role", "button");
        const open = () => {
            if (!canOpenDetail()) return;
            carousel.stop();
            carousel.settle();
            detail.open(slotIndex);
        };
        slots[i].addEventListener("click", open);
        slots[i].addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
            }
        });
    }

    const onResize = () => {
        carousel.measure();
        if (detail.state === "closed") carousel.applyTransforms();
    };
    window.addEventListener("resize", onResize);

    function detachProjectPlanes(gpuRef, imageIndex) {
        const main = gpuRef.planes[mainIdx(imageIndex)];
        if (main) main.trackedEl = null;
        for (let j = 0; j < SATELLITES_PER_IMAGE; j++) {
            const sat = gpuRef.planes[satIdx(imageIndex, j)];
            if (sat) sat.trackedEl = null;
        }
    }

    function hideSatellites(gpuRef, imageIndex) {
        for (let j = 0; j < SATELLITES_PER_IMAGE; j++) {
            const sat = gpuRef.planes[satIdx(imageIndex, j)];
            if (!sat) continue;
            sat.trackedEl = null;
            sat.opacity = 0;
        }
    }

    function primarySlotRect() {
        carousel.settle();
        carousel.applyTransforms();
        const slot = root.querySelectorAll(".case-scroll .slot")[CASE_STUDY_PRIMARY_SLOT];
        if (!slot) return null;
        const r = slot.getBoundingClientRect();
        return {x: r.left, y: r.top, w: r.width, h: r.height, z: 0};
    }

    return {
        carousel,
        detail,
        start() {
            active = true;
            detail.onClose = resumeCarousel;
            carousel.start();
        },
        stop() {
            active = false;
            detail.onClose = null;
            carousel.stop();
            if (detail.state !== "closed") {
                detail.forceClose();
            }
        },
        deactivate() {
            active = false;
            detail.onClose = null;
            carousel.stop();
        },
        prepareLeaveTransition(gpuRef, imageIndex) {
            active = false;
            detail.onClose = null;
            carousel.stop();
            carousel.settle();
            carousel.applyTransforms();

            const hero = detail.state !== "closed" ? detail.abortForLeave() : null;
            detachProjectPlanes(gpuRef, imageIndex);
            hideSatellites(gpuRef, imageIndex);

            const plane = gpuRef.planes[mainIdx(imageIndex)];
            if (!plane) return;

            const from = hero ?? primarySlotRect();
            if (!from) return;

            plane.bounds.x = from.x;
            plane.bounds.y = from.y;
            plane.bounds.w = from.w;
            plane.bounds.h = from.h;
            plane.bounds.z = 0;
            plane.opacity = 1;
            plane.trackedEl = null;
        },
        async settleDetail() {
            await detail.waitUntilClosed();
        },
        tick() {
            carousel.tick();
        },
        destroy() {
            active = false;
            detail.onClose = null;
            window.removeEventListener("resize", onResize);
            carousel.stop();
            detail.destroy();
        },
    };
}
