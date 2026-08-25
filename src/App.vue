<script setup>
import AppNav from './components/layout/AppNav.vue';
import AppFooter from './components/layout/AppFooter.vue';
import Preloader from './components/layout/Preloader.vue';
import CustomCursor from './components/layout/CustomCursor.vue';
</script>

<template>
  <Preloader/>
  <AppNav/>
  <main id="app"></main>
  <CustomCursor/>
  <AppFooter/>
</template>
