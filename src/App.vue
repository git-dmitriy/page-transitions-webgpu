<script setup>
import {computed} from 'vue';
import AppNav from './components/layout/AppNav.vue';
import AppFooter from './components/layout/AppFooter.vue';
import Preloader from './components/layout/Preloader.vue';
import CustomCursor from './components/layout/CustomCursor.vue';
import WorkPage from './components/pages/WorkPage.vue';
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
      <WorkPage v-if="entry.page === 'main'"/>
      <CaseStudyPage
          v-else-if="entry.page === 'inner'"
          :project="entry.project"
      />
    </div>
  </main>
  <CustomCursor/>
  <AppFooter/>
</template>
