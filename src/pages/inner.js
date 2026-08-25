export const INNER_X_OFFSETS_VW = [0, -14, 10, -6, 16];

const TITLES = [
    "Nova Commerce",
    "Atlas Dashboard",
    "Prism Studio",
    "Flux Banking",
    "Orbit CMS",
];

const FACTS = [
    "A full redesign of a fashion e-commerce storefront with a focus on product discovery and checkout speed. We rebuilt the catalog around lazy-loaded media, simplified the cart flow to three steps, and cut time-to-interaction on mobile by roughly forty percent.",
    "An analytics dashboard for a logistics team that needed live shipment tracking without the clutter of their legacy ERP. Custom chart components, role-based views, and a dark UI that stays readable on warehouse floor monitors.",
    "A portfolio site for a small design studio where motion carries most of the storytelling. WebGL-backed transitions between case studies, a CMS-driven project grid, and a contact flow wired into their existing Notion pipeline.",
    "A mobile banking app prototype built for user testing before a native rewrite. Biometric login, spending breakdowns, and transfer flows — all in a responsive web shell that matched the final iOS visual language.",
    "A headless CMS admin panel for a media company publishing across web, app, and newsletter. Block-based editor, preview modes for each channel, and a publishing API that reduced their average go-live time from hours to minutes.",
];

export function inner(image) {
    return function innerView() {
        const slots = [0, 1, 2, 3, 4]
            .map(
                (i) =>
                    `<div class="slot" style="transform: translateX(${INNER_X_OFFSETS_VW[i] ?? 0}vw);"><figure></figure></div>`,
            )
            .join('');
        return `
      <section data-page="inner" data-image="${image}" class="page page-inner">
        <h1 class="page-title">${TITLES[image]}</h1>
        <p class="inner-fact">${FACTS[image]}</p>
        <div class="stack">${slots}</div>
      </section>
    `;
    };
}

export function getInnerTargets(rootEl) {
    const slots = rootEl.querySelectorAll('.stack .slot');
    const rects = [];
    for (let i = 0; i < slots.length; i++) {
        const r = slots[i].getBoundingClientRect();
        rects.push({x: r.left, y: r.top, w: r.width, h: r.height});
    }
    return rects;
}
