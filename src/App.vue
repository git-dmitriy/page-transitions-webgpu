<script setup>
import {computed} from 'vue';
import AppNav from './components/layout/AppNav.vue';
import AppFooter from './components/layout/AppFooter.vue';
import Preloader from './components/layout/Preloader.vue';
import CustomCursor from './components/layout/CustomCursor.vue';
import GalleryPage from './components/pages/GalleryPage.vue';
import CloudPage from './components/pages/CloudPage.vue';
import CaseStudyPage from './components/pages/CaseStudyPage.vue';
import {pageStack} from './app-context.js';

const stack = computed(() => pageStack.stack);
</script>

<template>
  <Preloader/>
  <AppNav/>
  <main id="app">
    <div
        v-for="entry in stack"
        :key="entry.key"
        class="page-host"
        :style="entry.inactive ? { pointerEvents: 'none' } : undefined"
    >
      <GalleryPage v-if="entry.page === 'gallery'"/>
      <CloudPage v-else-if="entry.page === 'cloud'"/>
      <CaseStudyPage
          v-else-if="entry.page === 'inner'"
          :project="entry.project"
      />
    </div>
  </main>
  <CustomCursor/>
  <AppFooter/>
</template>
