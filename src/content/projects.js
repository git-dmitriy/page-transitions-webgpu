export const projects = [
    {
        slug: 'uppsala-embankment',
        title: 'Uppsala Embankment',
        description:
            'Fyrisån cuts through Uppsala under low autumn light — brick façades, bare branches, and the river slowing after the first cold weeks. Shot in Uppsala, Sweden by Ayadi Ghaith. Photo from Unsplash.',
        tags: ['Sweden', 'Autumn', 'City'],
        index: 0,
    },
    {
        slug: 'rain-path',
        title: 'Rain Path',
        description:
            'A wet walkway after a long shower — puddles, soft focus greens, and that flat light you only get when the sky never fully clears. Photographed by Ethan Hu. Photo from Unsplash.',
        tags: ['Rain', 'Path', 'Mood'],
        index: 1,
    },
    {
        slug: 'station-road',
        title: 'Station Road',
        description:
            'Wet asphalt after rain, fairy lights across the street, and a shop window holding the last warm light of the day. Station Road (Heol yr Orsaf), Wales — photographed by Mitchell Orr. Photo from Unsplash.',
        tags: ['UK', 'Autumn', 'Street'],
        index: 2,
    },
    {
        slug: 'vejle-street',
        title: 'Vejle Street',
        description:
            'Side street in Vejle with parked cars, shop fronts, and the cooler palette of a Danish autumn afternoon. Vejle, Denmark by Uladzislau Petrushkevich. Photo from Unsplash.',
        tags: ['Denmark', 'Autumn', 'Street'],
        index: 3,
    },
    {
        slug: 'harpers-ferry',
        title: 'Harpers Ferry',
        description:
            'An aerial look at the ridge town where the Potomac and Shenandoah meet — rooftops in the trees, hills turning early. Harpers Ferry, West Virginia by Joshua Hummell. Photo from Unsplash.',
        tags: ['USA', 'Autumn', 'Aerial'],
        index: 4,
    },
    {
        slug: 'bristol-alley',
        title: 'Bristol Alley',
        description:
            'A narrow Bristol passage at dusk — string lights, a lit shopfront, and the last of the day caught between the walls. Bristol, United Kingdom by Alexander Kaufmann. Photo from Unsplash.',
        tags: ['UK', 'Dusk', 'Alley'],
        index: 5,
    },
];

export function projectPath(slug) {
    return `/gallery/${slug}`;
}

export function projectBySlug(slug) {
    return projects.find((p) => p.slug === slug);
}
