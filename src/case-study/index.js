import {VerticalCarousel} from "./verticalCarousel.js";
import {CaseStudyDetail} from "./detail.js";
import {mainIdx, satIdx} from "../gpu.js";
import {CASE_STUDY_PRIMARY_SLOT, CASE_STUDY_SLOT_COUNT} from "./slots.js";

export {CASE_STUDY_SLOT_COUNT, CASE_STUDY_PRIMARY_SLOT, innerSatelliteSlotIndices, planeIndexForInnerSlot} from "./slots.js";

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

    detail.onClose = resumeCarousel;

    carousel.prepare();

    const slots = root.querySelectorAll(".case-scroll .slot");
    for (let i = 0; i < slots.length; i++) {
        const slotIndex = i;
        slots[i].tabIndex = 0;
        slots[i].setAttribute("role", "button");
        const open = () => {
            if (detail.state !== "closed") return;
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
        tick() {
            carousel.tick();
        },
        prepGpuPlane(gpuRef, imageIndex) {
            carousel.resetScroll();
            carousel.applyTransforms();
            const slots = root.querySelectorAll(".case-scroll .slot");
            const slot = slots[CASE_STUDY_PRIMARY_SLOT];
            if (!slot) return;
            const plane = gpuRef.planes[mainIdx(imageIndex)];
            const r = slot.getBoundingClientRect();
            plane.bounds.x = r.left;
            plane.bounds.y = r.top;
            plane.bounds.w = r.width;
            plane.bounds.h = r.height;
            plane.bounds.z = 0;
            plane.opacity = 1;
            plane.trackedEl = null;
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
