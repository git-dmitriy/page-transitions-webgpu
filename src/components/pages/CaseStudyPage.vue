<script setup>
import {inject, onMounted, onUnmounted, ref} from 'vue';
import {mainIdx, satIdx} from '../../gpu.js';
import {
  CASE_STUDY_SLOT_COUNT,
  createCaseStudy,
  planeIndexForInnerSlot,
} from '../../case-study/index.js';
import {useSlotBinding} from '../../composables/useSlotBinding.js';
import {canBindSlots} from '../../composables/canBindSlots.js';
import {controllerRef} from '../../app-context.js';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const gpu = inject('gpu');
const root = ref(null);

function slotPlaneIndex(slotIndex) {
  return planeIndexForInnerSlot(slotIndex, props.project.index, mainIdx, satIdx);
}

const {bindSlot} = useSlotBinding(gpu, slotPlaneIndex, {canBind: canBindSlots});

const slots = Array.from({length: CASE_STUDY_SLOT_COUNT}, (_, i) => i);

let caseStudy = null;

onMounted(() => {
  if (!root.value) return;

  caseStudy = createCaseStudy({
    root: root.value,
    gpu,
    project: props.project,
  });

  const controller = controllerRef.value;
  if (controller) {
    controller.caseStudy = caseStudy;
    if (!controller.mutating) caseStudy.start();
  }
});

onUnmounted(() => {
  caseStudy?.destroy();
  const controller = controllerRef.value;
  if (controller?.caseStudy === caseStudy) {
    controller.caseStudy = null;
  }
});
</script>

<template>
  <section
      ref="root"
      data-page="inner"
      :data-image="project.index"
      class="page page-inner"
  >
    <h1 class="page-title">{{ project.title }}</h1>
    <p class="inner-fact">{{ project.description }}</p>

    <div class="case-scroll">
      <div
          v-for="i in slots"
          :key="i"
          :class="['slot', 'case-slot', `case-slot--${i}`]"
          :ref="(el) => bindSlot(i, el)"
      >
        <figure></figure>
      </div>
    </div>

    <div class="case-detail">
      <div class="case-detail__copy">
        <button class="case-detail__back" type="button">Back (Esc)</button>
        <h2 class="case-detail__title">{{ project.title }}</h2>
        <p class="case-detail__body">{{ project.description }}</p>
      </div>
    </div>
  </section>
</template>
