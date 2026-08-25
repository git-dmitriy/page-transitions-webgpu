<script setup>
import {inject, onMounted, onUnmounted, ref} from 'vue';
import {Carousel} from '../../carousel.js';
import {mainIdx} from '../../gpu.js';
import {useSlotBinding} from '../../composables/useSlotBinding.js';

const CAPTIONS = [
  'Nova Commerce',
  'Atlas Dashboard',
  'Prism Studio',
  'Flux Banking',
  'Orbit CMS',
];

const controller = inject('controller');
const gpu = inject('gpu');
const root = ref(null);

const {bindSlot} = useSlotBinding(gpu, mainIdx);

let carousel = null;

onMounted(() => {
  carousel = new Carousel(root.value);
  controller.carousel = carousel;
});

onUnmounted(() => {
  carousel?.stop();
  if (controller.carousel === carousel) {
    controller.carousel = null;
  }
});
</script>

<template>
  <section ref="root" data-page="main" class="page page-main">
    <h1 class="page-title">Work</h1>
    <div class="carousel">
      <a
          v-for="(caption, i) in CAPTIONS"
          :key="caption"
          :href="`/${i + 1}`"
          data-link
          :class="['slot', `slot-${i}`]"
          :ref="(el) => bindSlot(i, el)"
      >
        <figure></figure>
        <div class="slot-caption">{{ caption }}</div>
      </a>
    </div>
  </section>
</template>
