import gsap from "gsap";

const COUNT_DURATION = 1.6;
const HOLD_DURATION = 0.35;
const FADE_DURATION = 0.6;

export class Preloader {
    _root() {
        return document.getElementById("preloader");
    }

    _counter() {
        return this._root()?.querySelector(".preloader-count") ?? null;
    }

    async count() {
        const countEl = this._counter();
        if (!countEl) return;
        const counter = {value: 0};
        await gsap.to(counter, {
            value: 100,
            duration: COUNT_DURATION,
            ease: "power1.inOut",
            onUpdate: () => {
                countEl.textContent = `${Math.round(counter.value)}%`;
            },
        });
        await gsap.to({}, {duration: HOLD_DURATION});
    }

    async reveal() {
        const el = this._root();
        if (!el) return;
        await gsap.to(el, {
            autoAlpha: 0,
            duration: FADE_DURATION,
            ease: "power2.inOut",
        });
        el.style.display = "none";
    }
}
