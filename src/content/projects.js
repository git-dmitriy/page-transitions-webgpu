export const projects = [
    {
        slug: 'nova-commerce',
        title: 'Nova Commerce',
        description:
            'A full redesign of a fashion e-commerce storefront with a focus on product discovery and checkout speed. We rebuilt the catalog around lazy-loaded media, simplified the cart flow to three steps, and cut time-to-interaction on mobile by roughly forty percent.',
        tags: ['E-commerce', 'Vue', 'Performance'],
        index: 0,
    },
    {
        slug: 'atlas-dashboard',
        title: 'Atlas Dashboard',
        description:
            'An analytics dashboard for a logistics team that needed live shipment tracking without the clutter of their legacy ERP. Custom chart components, role-based views, and a dark UI that stays readable on warehouse floor monitors.',
        tags: ['Dashboard', 'Data viz', 'React'],
        index: 1,
    },
    {
        slug: 'prism-studio',
        title: 'Prism Studio',
        description:
            'A portfolio site for a small design studio where motion carries most of the storytelling. WebGL-backed transitions between case studies, a CMS-driven project grid, and a contact flow wired into their existing Notion pipeline.',
        tags: ['Portfolio', 'WebGL', 'CMS'],
        index: 2,
    },
    {
        slug: 'flux-banking',
        title: 'Flux Banking',
        description:
            'A mobile banking app prototype built for user testing before a native rewrite. Biometric login, spending breakdowns, and transfer flows — all in a responsive web shell that matched the final iOS visual language.',
        tags: ['Mobile', 'Fintech', 'Prototype'],
        index: 3,
    },
    {
        slug: 'orbit-cms',
        title: 'Orbit CMS',
        description:
            'A headless CMS admin panel for a media company publishing across web, app, and newsletter. Block-based editor, preview modes for each channel, and a publishing API that reduced their average go-live time from hours to minutes.',
        tags: ['CMS', 'Node', 'Editor'],
        index: 4,
    },
];

export function projectPath(slug) {
    return `/work/${slug}`;
}

export function projectBySlug(slug) {
    return projects.find((p) => p.slug === slug);
}
