<script setup>
import {inject, onMounted, onUnmounted, ref} from 'vue';
import {Carousel} from '../../carousel.js';
import {mainIdx} from '../../gpu.js';
import {projects, projectPath} from '../../content/projects.js';
import {useSlotBinding} from '../../composables/useSlotBinding.js';
import {canBindSlots} from '../../composables/canBindSlots.js';
import {controllerRef} from '../../app-context.js';

const gpu = inject('gpu');
const root = ref(null);

const {bindSlot} = useSlotBinding(gpu, mainIdx, {canBind: canBindSlots});

let carousel = null;

onMounted(() => {
  const controller = controllerRef.value;
  if (!controller) return;
  carousel = new Carousel(root.value);
  controller.carousel = carousel;
});

onUnmounted(() => {
  const controller = controllerRef.value;
  carousel?.stop();
  if (controller?.carousel === carousel) {
    controller.carousel = null;
  }
});
</script>

<template>
  <section ref="root" data-page="main" class="page page-main">
    <h1 class="page-title">Work</h1>
    <div class="carousel">
      <a
          v-for="project in projects"
          :key="project.slug"
          :href="projectPath(project.slug)"
          data-link
          :class="['slot', `slot-${project.index}`]"
          :ref="(el) => bindSlot(project.index, el)"
      >
        <figure></figure>
        <div class="slot-caption">{{ project.title }}</div>
      </a>
    </div>
  </section>
</template>
