export const projects = [
    {
        slug: 'uppsala-embankment',
        title: 'Uppsala Embankment',
        description:
            'The Fyrisån in Uppsala in late autumn: brick, bare trees, slow water. Ayadi Ghaith.',
        index: 0,
    },
    {
        slug: 'rain-path',
        title: 'Rain Path',
        description:
            'A path after a long rain, puddles and greens gone soft. Ethan Hu.',
        index: 1,
    },
    {
        slug: 'station-road',
        title: 'Station Road',
        description:
            'Station Road (Heol yr Orsaf), Wales. Wet asphalt, fairy lights, a shop still open. Mitchell Orr.',
        index: 2,
    },
    {
        slug: 'vejle-street',
        title: 'Vejle Street',
        description:
            'Side street in Vejle, Denmark: parked cars, shopfronts, a cool afternoon. Uladzislau Petrushkevich.',
        index: 3,
    },
    {
        slug: 'harpers-ferry',
        title: 'Harpers Ferry',
        description:
            'Harpers Ferry from above, where the Potomac and Shenandoah meet. Joshua Hummell.',
        index: 4,
    },
    {
        slug: 'bristol-alley',
        title: 'Bristol Alley',
        description:
            'A Bristol passage at dusk: string lights and one lit shopfront. Alexander Kaufmann.',
        index: 5,
    },
];

export function projectPath(slug) {
    return `/gallery/${slug}`;
}
