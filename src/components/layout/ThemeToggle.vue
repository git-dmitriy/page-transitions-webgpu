<script setup>
import {onMounted, ref} from 'vue';
import {getTheme, initTheme, toggleTheme} from '../../composables/useTheme.js';

const theme = ref('light');

onMounted(() => {
  initTheme();
  theme.value = getTheme();
});

function onToggle() {
  toggleTheme();
  theme.value = getTheme();
}
</script>

<template>
  <button
      class="theme-toggle"
      type="button"
      :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
      @click="onToggle"
  >
    <svg
        v-if="theme === 'dark'"
        class="theme-toggle__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <path
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
    <svg
        v-else
        class="theme-toggle__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
      <path
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
          d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"
      />
    </svg>
  </button>
</template>
