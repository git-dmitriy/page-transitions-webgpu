import Lenis from "lenis";
import {GPU} from "./gpu.js";
import {Controller} from "./controller.js";
import {Cursor} from "./cursor.js";
import {Preloader} from "./preloader.js";

async function start() {
    const lenis = new Lenis({
        smoothWheel: true,
        syncTouch: true,
        lerp: 0.09,
    });

    // Count up while textures load and the page is built behind the overlay.
    const preloader = new Preloader();
    const counting = preloader.count();

    const gpu = new GPU();
    await gpu.init();

    const controller = new Controller({
        app: document.getElementById("app"),
        gpu,
        lenis,
    });
    await controller.start();

    function raf(time) {
        lenis.raf(time);
        controller.tick();
        gpu.update();
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Hold until the counter reaches 100%, then lift the overlay and, in the same
    // tick, play the page intro so its hidden start states are applied before the
    // overlay clears (no flash of resting content).
    await counting;
    controller.playIntro();
    preloader.reveal();

    const cursor = new Cursor();
    cursor.start();
}

start();
