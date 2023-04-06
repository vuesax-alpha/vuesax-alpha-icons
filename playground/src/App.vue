<template>
  <component
    :is="Icon"
    v-for="(Icon, key) in icons"
    :key="key"
    class="icon"
    :class="key"
  />
  <hr />
</template>

<script lang="ts" setup>
import { icons } from '@vuesax-alpha/icons-vue/global'
</script>

<style>
.icon {
  --color: inherit;
  height: 1em;
  width: 1em;
  line-height: 1em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  fill: currentColor;
  color: var(--color);
  font-size: inherit;
}
svg {
  height: 1em;
  width: 1em;
}
path {
  fill: currentColor;
}
</style>
