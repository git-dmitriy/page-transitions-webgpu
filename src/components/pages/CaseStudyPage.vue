<script setup>
import {inject} from 'vue';
import {mainIdx, satIdx} from '../../gpu.js';
import {INNER_X_OFFSETS_VW} from '../../core/layout.js';
import {useSlotBinding} from '../../composables/useSlotBinding.js';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const gpu = inject('gpu');
const {bindSlot: bindPlane} = useSlotBinding(gpu, (i) => i);

function bindSlot(slotIndex, el) {
  if (!el) return;
  const image = props.project.index;
  const planeIndex =
      slotIndex === 0 ? mainIdx(image) : satIdx(image, slotIndex - 1);
  bindPlane(planeIndex, el);
}

const slotIndexes = [0, 1, 2, 3, 4];
</script>

<template>
  <section
      data-page="inner"
      :data-image="project.index"
      class="page page-inner"
  >
    <h1 class="page-title">{{ project.title }}</h1>
    <p class="inner-fact">{{ project.description }}</p>
    <div class="stack">
      <div
          v-for="i in slotIndexes"
          :key="i"
          class="slot"
          :style="{ transform: `translateX(${INNER_X_OFFSETS_VW[i] ?? 0}vw)` }"
          :ref="(el) => bindSlot(i, el)"
      >
        <figure></figure>
      </div>
    </div>
  </section>
</template>
