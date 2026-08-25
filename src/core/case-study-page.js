import {createApp, nextTick} from 'vue';
import CaseStudyPage from '../components/pages/CaseStudyPage.vue';

export async function mountCaseStudyPage(container, {controller, gpu, project}) {
    const host = document.createElement('div');
    container.appendChild(host);

    const vueApp = createApp(CaseStudyPage, {project});
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

export function unmountCaseStudyPage(mount) {
    if (!mount) return;
    mount.vueApp.unmount();
    mount.host.remove();
}
