import gsap from "gsap";
import {SplitText} from "gsap/SplitText";
import {projects, projectPath} from "./content/projects.js";
import {
    CASE_STUDY_PRIMARY_SLOT,
    innerSatelliteSlotIndices,
} from "./case-study/index.js";
import {IndexFloat} from "./core/indexFloat.js";
import {MAIN_COUNT, SATELLITES_PER_IMAGE, mainIdx, satIdx} from "./gpu.js";

import {IndexToInnerTransition} from "./transitions/indexToInner.js";
import {IndexToMainTransition} from "./transitions/indexToMain.js";
import {InnerToIndexTransition} from "./transitions/innerToIndex.js";
import {InnerToMainTransition} from "./transitions/innerToMain.js";
import {MainToIndexTransition} from "./transitions/mainToIndex.js";
import {MainToInnerTransition} from "./transitions/mainToInner.js";

gsap.registerPlugin(SplitText);

// Carousel scroll tilt: the harder you scroll the gallery page, the more the
// planes rotate about their Y axis (perspective lean). Tilt is derived from the
// carousel's per-frame velocity (px), clamped, and eased toward so it springs
// back to flat when scrolling stops.
const TILT_RAD_PER_PX = 0.005;
const TILT_MAX_RAD = 0.05; // ~11 degrees
const TILT_LERP = 0.09;

const INNER_TILT_RAD_PER_PX = 0.003;
const INNER_TILT_MAX_RAD = 0.05;
const INNER_TILT_LERP = 0.09;

const TITLE_IN_DURATION = 0.7;
const TITLE_IN_STAGGER = 0.04;
const TITLE_OUT_DURATION = 0.45;
const TITLE_OUT_STAGGER = 0.025;

function animateTitleIn(sec) {
    if (!sec) return null;
    const h1 = sec.querySelector(".page-title");
    if (!h1) return null;
    const split = SplitText.create(h1, {type: "words", mask: "words"});
    sec._titleSplit = split;
    return gsap.from(split.words, {
        yPercent: 102,
        duration: TITLE_IN_DURATION,
        stagger: TITLE_IN_STAGGER,
        ease: "power3.out",
    });
}

function animateTitleOut(sec) {
    if (!sec) return null;
    const split = sec._titleSplit;
    if (!split) return null;
    return gsap.to(split.words, {
        yPercent: -102,
        duration: TITLE_OUT_DURATION,
        stagger: TITLE_OUT_STAGGER,
        ease: "power3.out",
    });
}

const FACT_IN_DURATION = 0.8;
const FACT_IN_STAGGER = 0.08;
const FACT_OUT_DURATION = 0.5;
const FACT_OUT_STAGGER = 0.05;

function animateFactIn(sec) {
    if (!sec) return null;
    const p = sec.querySelector(".inner-fact");
    if (!p) return null;
    const split = SplitText.create(p, {type: "lines", mask: "lines"});
    sec._factSplit = split;
    return gsap.from(split.lines, {
        yPercent: 102,
        duration: FACT_IN_DURATION,
        stagger: FACT_IN_STAGGER,
        ease: "power3.out",
        delay: 0.1,
    });
}

function animateFactOut(sec) {
    if (!sec) return null;
    const split = sec._factSplit;
    if (!split) return null;
    return gsap.to(split.lines, {
        yPercent: -102,
        duration: FACT_OUT_DURATION,
        stagger: FACT_OUT_STAGGER,
        ease: "power3.out",
    });
}

const CAPTION_IN_DURATION = 0.7;
const CAPTION_IN_STAGGER = 0.06;
const CAPTION_OUT_DURATION = 0.45;
const CAPTION_OUT_STAGGER = 0.04;

function animateCaptionsIn(sec) {
    if (!sec) return null;
    const captions = sec.querySelectorAll(".slot-caption");
    if (!captions.length) return null;
    const allLines = [];
    const splits = [];
    for (const cap of captions) {
        const split = SplitText.create(cap, {type: "lines", mask: "lines"});
        splits.push(split);
        allLines.push(...split.lines);
    }
    sec._captionSplits = splits;
    return gsap.from(allLines, {
        yPercent: 102,
        duration: CAPTION_IN_DURATION,
        stagger: CAPTION_IN_STAGGER,
        ease: "power3.out",
        delay: 0.15,
    });
}

function animateCaptionsOut(sec) {
    if (!sec) return null;
    const splits = sec._captionSplits;
    if (!splits || !splits.length) return null;
    const allLines = [];
    for (const split of splits) allLines.push(...split.lines);
    return gsap.to(allLines, {
        yPercent: -102,
        duration: CAPTION_OUT_DURATION,
        stagger: CAPTION_OUT_STAGGER,
        ease: "power3.out",
    });
}

// ---------------------------------------------------------------------------
// Intro: played once on the first page load (never on SPA transitions). The
// active planes fade up while the persistent chrome — the left nav and the
// footer links — rises in with the same masked split-text reveal the page
// title (top-right indicator) uses.
// ---------------------------------------------------------------------------

const INTRO_TEXT_DURATION = 0.7;
const INTRO_TEXT_STAGGER = 0.06;
const INTRO_NAV_DELAY = 0.1;
const INTRO_FOOTER_DELAY = 0.2;
const INTRO_PLANE_DURATION = 1.0;
const INTRO_PLANE_STAGGER = 0.08;

// Masked word reveal for a group of persistent chrome links (#nav / #footer),
// matching animateTitleIn. The split is reverted on completion so hover
// underlines and layout return to their original markup.
function animateChromeIn(selector, delay) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return null;
    const splits = [];
    const words = [];
    for (const el of els) {
        const split = SplitText.create(el, {type: "words", mask: "words"});
        splits.push(split);
        words.push(...split.words);
    }
    // Links are hidden via CSS until now (avoids a flash while textures load);
    // reveal them in the same tick the words are masked and offset below.
    gsap.set(els, {opacity: 1});
    return gsap.from(words, {
        yPercent: 102,
        duration: INTRO_TEXT_DURATION,
        stagger: INTRO_TEXT_STAGGER,
        ease: "power3.out",
        delay,
        onComplete: () => splits.forEach((s) => s.revert()),
    });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

function buildRoutes() {
    const routes = {
        "/": {page: "gallery", image: null},
        "/cloud": {page: "cloud", image: null},
    };

    for (const project of projects) {
        routes[`/gallery/${project.slug}`] = {
            page: "inner",
            project,
            image: project.index,
        };
    }

    return routes;
}

const ROUTES = buildRoutes();

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export class Controller {
    constructor({app, gpu, lenis, pageStack}) {
        this.app = app;
        this.gpu = gpu;
        this.lenis = lenis;
        this.pageStack = pageStack;
        this.routes = ROUTES;

        this.transitions = {
            "gallery->inner": new MainToInnerTransition(),
            "inner->gallery": new InnerToMainTransition(),
            "gallery->cloud": new MainToIndexTransition(),
            "cloud->gallery": new IndexToMainTransition(),
            "cloud->inner": new IndexToInnerTransition(),
            "inner->cloud": new InnerToIndexTransition(),
        };

        this.current = null;
        this.mutating = false;
        this.introDone = false;
        this.carousel = null;
        this.indexFloat = null;

        this.caseStudy = null;
        this.pendingNav = null;

        this.onClick = this.onClick.bind(this);
        this.onPopState = this.onPopState.bind(this);
    }

    async start() {
        document.addEventListener("click", this.onClick);
        window.addEventListener("popstate", this.onPopState);
        this.gpu.onResizeLayout = () => this._reapplyLayout();
        await this._renderInitial(window.location.pathname);
    }

    tick() {
        if (this.carousel) {
            this.carousel.tick();
            this._applyCarouselTilt(this.carousel.velocity);
        }
        if (this.indexFloat) this.indexFloat.tick();
        if (this.caseStudy && this.current?.page === "inner") {
            this.caseStudy.tick();
            if (!this.mutating) {
                this._applyInnerTilt(
                    this.current.image,
                    this.caseStudy.carousel.velocity,
                );
            }
        }
    }

    _innerTiltPlanes(image) {
        const planes = [this.gpu.planes[mainIdx(image)]];
        for (let j = 0; j < SATELLITES_PER_IMAGE; j++) {
            planes.push(this.gpu.planes[satIdx(image, j)]);
        }
        return planes;
    }

    _applyInnerTilt(image, velocity) {
        let target = velocity * INNER_TILT_RAD_PER_PX;
        if (target > INNER_TILT_MAX_RAD) target = INNER_TILT_MAX_RAD;
        else if (target < -INNER_TILT_MAX_RAD) target = -INNER_TILT_MAX_RAD;
        for (const plane of this._innerTiltPlanes(image)) {
            plane.tiltX += (target - plane.tiltX) * INNER_TILT_LERP;
        }
    }

    _applyCarouselTilt(velocity) {
        let target = velocity * TILT_RAD_PER_PX;
        if (target > TILT_MAX_RAD) target = TILT_MAX_RAD;
        else if (target < -TILT_MAX_RAD) target = -TILT_MAX_RAD;
        for (let i = 0; i < MAIN_COUNT; i++) {
            const plane = this.gpu.planes[mainIdx(i)];
            plane.tilt += (target - plane.tilt) * TILT_LERP;
        }
    }

    _routeFor(path) {
        return this.routes[path] ?? this.routes["/"];
    }

    async _renderInitial(path) {
        const route = this._routeFor(path);
        this.current = {path, ...route};
        await this.pageStack.setSingle(path, route);
        this._snapLayout(this.current);
        this._setActiveNav(this.current.page);
        this._enterPage(this.current);
        for (const p of this.gpu.planes) {
            p.introVisible = p.opacity > 0.001;
            p.opacity = 0;
        }
    }

    playIntro() {
        const sec = this.app.querySelector(`[data-page="${this.current.page}"]`);
        animateTitleIn(sec);
        animateFactIn(sec);
        animateCaptionsIn(sec);

        const planes = this.gpu.planes.filter((p) => p.introVisible);
        if (planes.length) {
            gsap.to(planes, {
                opacity: 1,
                duration: INTRO_PLANE_DURATION,
                stagger: INTRO_PLANE_STAGGER,
                ease: "power2.out",
                onComplete: () => {
                    this.introDone = true;
                },
            });
        } else {
            this.introDone = true;
        }
        animateChromeIn("#nav a", INTRO_NAV_DELAY);
        animateChromeIn("#footer a", INTRO_FOOTER_DELAY);
    }

    _detailIsOpen() {
        const state = this.caseStudy?.detail?.state;
        return Boolean(state && state !== "closed");
    }

    _syncPlaneToEl(plane, el) {
        plane.trackedEl = el;
        const rect = el.getBoundingClientRect();
        plane.bounds.x = rect.left;
        plane.bounds.y = rect.top;
        plane.bounds.w = rect.width;
        plane.bounds.h = rect.height;
    }

    _syncPageSlots(state) {
        if (state.page === "inner" && this._detailIsOpen()) return;

        const sec = this.app.querySelector(`[data-page="${state.page}"]`);
        if (!sec) return;

        if (state.page === "gallery") {
            const slots = sec.querySelectorAll(".slot");
            for (let i = 0; i < slots.length && i < MAIN_COUNT; i++) {
                this._syncPlaneToEl(this.gpu.planes[mainIdx(i)], slots[i]);
            }
            return;
        }

        if (state.page === "inner") {
            const slots = sec.querySelectorAll(".case-scroll .slot");
            if (!slots.length) return;
            this._syncPlaneToEl(
                this.gpu.planes[mainIdx(state.image)],
                slots[CASE_STUDY_PRIMARY_SLOT],
            );
            const satSlots = innerSatelliteSlotIndices();
            for (let j = 0; j < SATELLITES_PER_IMAGE; j++) {
                const slot = slots[satSlots[j]];
                if (!slot) continue;
                this._syncPlaneToEl(this.gpu.planes[satIdx(state.image, j)], slot);
            }
        }
    }

    _enterPage(state, {projectCloud = true} = {}) {
        const sec = this.app.querySelector(`[data-page="${state.page}"]`);
        if (!sec) return;

        if (state.page === "gallery") {
            document.body.style.height = "100vh";
            this.lenis.stop();
            this.lenis.scrollTo(0, {immediate: true, force: true});
            this.carousel?.start();
            this._syncPageSlots(state);
            return;
        }

        if (state.page === "inner") {
            document.body.style.height = "100vh";
            this.lenis.stop();
            this.lenis.scrollTo(0, {immediate: true, force: true});
            this._prepareInnerTransition();
            this.caseStudy?.start();
            this._syncPageSlots(state);
            return;
        }

        if (state.page === "cloud") {
            document.body.style.height = "100vh";
            this.lenis.stop();
            this.lenis.scrollTo(0, {immediate: true, force: true});
            if (!this.indexFloat) {
                this.indexFloat = new IndexFloat(this.gpu);
                this.indexFloat.prepare();
            }
            this.indexFloat.start({project: projectCloud});
            this._bindIndexFloatSelect();
        }
    }

    _bindIndexFloatSelect() {
        if (!this.indexFloat) return;
        this.indexFloat.onSelect = (image) => {
            if (this.mutating) return;
            const project = projects.find((p) => p.index === image);
            if (project) this.navigate(projectPath(project.slug));
        };
    }

    _leavePage(state) {
        if (!state) return;
        if (state.page === "gallery" && this.carousel) {
            this.carousel.stop();
            this.carousel = null;
            for (let i = 0; i < MAIN_COUNT; i++) this.gpu.planes[mainIdx(i)].tilt = 0;
        }
        if (state.page === "cloud" && this.indexFloat) {
            this.indexFloat.stop();
            this.indexFloat = null;
        }
        if (state.page === "inner") {
            for (const plane of this._innerTiltPlanes(state.image)) plane.tiltX = 0;
            this.caseStudy?.deactivate();
        }
        for (const plane of this.gpu.planes) {
            plane.trackedEl = null;
        }
    }

    _setActiveNav(pageKey) {
        const activeKey =
            pageKey === "gallery" ? "gallery" : pageKey === "cloud" ? "cloud" : null;
        const links = document.querySelectorAll("#nav a[data-nav-key]");
        for (const a of links) {
            if (activeKey && a.getAttribute("data-nav-key") === activeKey) {
                a.classList.add("is-active");
            } else {
                a.classList.remove("is-active");
            }
        }
    }

    _snapLayout(state) {
        if (state.page === "inner" && this._detailIsOpen()) return;
        if (state.page === "gallery") this.gpu.applyMainLayout();
        else if (state.page === "cloud") this.gpu.applyIndexLayout();
        else if (state.page === "inner") this.gpu.applyInnerLayout(state.image);
    }

    _reapplyLayout() {
        if (!this.current || this.mutating) return;
        if (this.current.page === "gallery" && this.carousel) {
            this.carousel.measure();
            return;
        }
        if (this.current.page === "cloud" && this.indexFloat) {
            this.indexFloat.measure();
            return;
        }
        if (this.current.page === "inner" && this.caseStudy) {
            this.caseStudy.carousel.measure();
            return;
        }
        this._snapLayout(this.current);
    }

    _resolveTransition(from, to) {
        return this.transitions[`${from}->${to}`];
    }

    _waitLayout() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
    }

    _prepareInnerTransition() {
        const carousel = this.caseStudy?.carousel;
        if (!carousel) return;
        carousel.resetScroll();
        carousel.prepare();
    }

    async navigate(path, target = null) {
        if (this.mutating) {
            this.pendingNav = {path, target};
            return;
        }
        if (path === this.current?.path) return;
        const next = this.routes[path];
        if (!next) return;

        const fromState = this.current;
        const toState = {path, ...next};
        const transition = this._resolveTransition(fromState.page, next.page);
        if (!transition) return;

        this.mutating = true;
        this.pendingNav = null;
        if (target !== "back") history.pushState({path}, "", path);
        this._setActiveNav(next.page);

        const fromElNow = this.app.children[0];
        const titleOut = animateTitleOut(fromElNow);
        const factOut = animateFactOut(fromElNow);
        const captionsOut = animateCaptionsOut(fromElNow);

        if (fromState.page === "inner" && this.caseStudy) {
            await this.caseStudy.settleDetail();
            this.caseStudy.prepareLeaveTransition(this.gpu, fromState.image);
        }

        this._leavePage(fromState);

        await this.pageStack.pushTransition(path, next);
        this.pageStack.markOutgoingInactive();

        const fromEl = this.app.children[0];
        const toEl = this.app.children[1];

        if (next.page === "gallery") {
            this.carousel?.prepare();
        }

        if (next.page === "cloud") {
            this.indexFloat = new IndexFloat(this.gpu);
            this.indexFloat.prepare();
        }

        if (next.page === "inner") {
            this._prepareInnerTransition();
            await this._waitLayout();
        }

        if (window.scrollY !== 0 || window.scrollX !== 0) {
            this.lenis.scrollTo(0, {immediate: true, force: true});
            window.scrollTo(0, 0);
        }

        const titleIn = animateTitleIn(toEl);
        const factIn = animateFactIn(toEl);
        const captionsIn = animateCaptionsIn(toEl);

        const ctx = {
            gpu: this.gpu,
            fromImage: fromState.image,
            toImage: next.image,
            indexFloat: this.indexFloat,
        };
        const txOut = transition.out(fromEl, toEl, ctx);
        const txIn = transition.in(fromEl, toEl, ctx);

        await Promise.all([
            titleOut,
            titleIn,
            factOut,
            factIn,
            captionsOut,
            captionsIn,
            txOut,
            txIn,
        ]);

        await this.pageStack.dropOutgoing();
        this.current = toState;
        this._snapLayout(toState);
        this._enterPage(toState, {projectCloud: false});
        this.mutating = false;

        const pending = this.pendingNav;
        this.pendingNav = null;
        if (pending && pending.path !== this.current?.path) {
            await this.navigate(pending.path, pending.target);
        }
    }

    onClick(e) {
        const a = e.target.closest("a[data-link]");
        if (!a) return;
        e.preventDefault();
        const href = a.getAttribute("href");
        this.navigate(href);
    }

    onPopState() {
        this.navigate(window.location.pathname, "back");
    }
}
