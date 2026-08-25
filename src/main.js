import {createApp} from 'vue';
import Lenis from 'lenis';
import App from './App.vue';
import {GPU} from './gpu.js';
import {Controller} from './controller.js';
import {Cursor} from './cursor.js';
import {Preloader} from './preloader.js';

async function start() {
    createApp(App).mount('#root');

    const lenis = new Lenis({
        smoothWheel: true,
        syncTouch: true,
        lerp: 0.09,
    });

    const preloader = new Preloader();
    const counting = preloader.count();

    const gpu = new GPU();
    await gpu.init();

    const controller = new Controller({
        app: document.getElementById('app'),
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

    await counting;
    controller.playIntro();
    preloader.reveal();

    const cursor = new Cursor();
    cursor.start();
}

start();
