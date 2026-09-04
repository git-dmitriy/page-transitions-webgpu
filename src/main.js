import {createApp} from 'vue';
import App from './App.vue';
import {GPU} from './gpu.js';
import {Controller} from './controller.js';
import {Cursor} from './cursor.js';
import {Preloader} from './preloader.js';
import {controllerRef, pageStack} from './app-context.js';
import {initTheme} from './composables/useTheme.js';

async function start() {
    initTheme();

    const gpu = new GPU();
    try {
        await gpu.init();
    } catch {
        gpu.destroy();
        document.getElementById("no-webgpu")?.removeAttribute("hidden");
        return;
    }

    const app = createApp(App);
    app.provide('gpu', gpu);
    app.mount('#root');

    const preloader = new Preloader();
    const counting = preloader.count();

    const controller = new Controller({
        app: document.getElementById('app'),
        gpu,
        pageStack,
    });
    controllerRef.value = controller;
    await controller.start();

    function raf() {
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
