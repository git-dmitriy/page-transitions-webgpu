import {reactive, nextTick} from 'vue';

export function createPageStack() {
    let entryId = 0;
    const stack = reactive([]);

    function createEntry(path, route) {
        return {
            key: `page-${++entryId}`,
            path,
            page: route.page,
            project: route.project ?? null,
            inactive: false,
        };
    }

    async function setSingle(path, route) {
        stack.splice(0, stack.length, createEntry(path, route));
        await nextTick();
    }

    async function pushTransition(path, route) {
        stack.push(createEntry(path, route));
        await nextTick();
    }

    function markOutgoingInactive() {
        if (stack[0]) stack[0].inactive = true;
    }

    async function dropOutgoing() {
        if (stack.length > 1) stack.shift();
        await nextTick();
    }

    return {
        stack,
        createEntry,
        setSingle,
        pushTransition,
        markOutgoingInactive,
        dropOutgoing,
    };
}
