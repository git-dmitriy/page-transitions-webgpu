import {createApp, nextTick} from 'vue';
import WorkPage from '../components/pages/WorkPage.vue';

export async function mountWorkPage(container, {controller, gpu}) {
    const host = document.createElement('div');
    container.appendChild(host);

    const vueApp = createApp(WorkPage);
    vueApp.provide('controller', controller);
    vueApp.provide('gpu', gpu);
    vueApp.mount(host);

    await nextTick();

    return {
        vueApp,
        host,
        section: host.firstElementChild,
    };
}

export function unmountWorkPage(mount) {
    if (!mount) return;
    mount.vueApp.unmount();
    mount.host.remove();
}
