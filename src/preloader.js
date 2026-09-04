import gsap from "gsap";
import {SplitText} from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const COUNT_DURATION = 1.6;
const HOLD_DURATION = 0.35;
const FADE_DURATION = 0.6;
const TEXT_IN_DURATION = 0.7;
const TEXT_IN_STAGGER = 0.04;
const TEXT_OUT_DURATION = 0.45;
const TEXT_OUT_STAGGER = 0.025;
const TAGLINE_IN_DELAY = 0.1;

export class Preloader {
    constructor() {
        this._titleSplit = null;
        this._taglineSplit = null;
    }

    _root() {
        return document.getElementById("preloader");
    }

    _counter() {
        return this._root()?.querySelector(".preloader-count") ?? null;
    }

    _playTextIn() {
        const root = this._root();
        if (!root) return;

        const title = root.querySelector(".preloader-title");
        const tagline = root.querySelector(".preloader-tagline");

        if (title) {
            this._titleSplit = SplitText.create(title, {type: "words", mask: "words"});
            gsap.set(title, {opacity: 1});
            gsap.from(this._titleSplit.words, {
                yPercent: 102,
                duration: TEXT_IN_DURATION,
                stagger: TEXT_IN_STAGGER,
                ease: "power3.out",
            });
        }

        if (tagline) {
            this._taglineSplit = SplitText.create(tagline, {type: "lines", mask: "lines"});
            gsap.set(tagline, {opacity: 0.5});
            gsap.from(this._taglineSplit.lines, {
                yPercent: 102,
                duration: TEXT_IN_DURATION,
                stagger: TEXT_IN_STAGGER,
                ease: "power3.out",
                delay: TAGLINE_IN_DELAY,
            });
        }
    }

    async _playTextOut() {
        const tweens = [];
        if (this._titleSplit) {
            tweens.push(
                gsap.to(this._titleSplit.words, {
                    yPercent: -102,
                    duration: TEXT_OUT_DURATION,
                    stagger: TEXT_OUT_STAGGER,
                    ease: "power3.out",
                }),
            );
        }
        if (this._taglineSplit) {
            tweens.push(
                gsap.to(this._taglineSplit.lines, {
                    yPercent: -102,
                    duration: TEXT_OUT_DURATION,
                    stagger: TEXT_OUT_STAGGER,
                    ease: "power3.out",
                }),
            );
        }
        if (tweens.length) await Promise.all(tweens);
    }

    async count() {
        this._playTextIn();
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
        await this._playTextOut();
        await gsap.to(el, {
            autoAlpha: 0,
            duration: FADE_DURATION,
            ease: "power2.inOut",
        });
        el.style.display = "none";
    }
}
