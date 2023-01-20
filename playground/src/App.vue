<template>
  <component
    :is="Icon"
    v-for="(Icon, key) in icons"
    :key="key"
    class="icon"
    :class="key"
  />
  <hr />
  <component
    :is="`VsIcon${key}`"
    v-for="key in Object.keys(icons)"
    :key="key"
    class="icon"
  />
</template>

<script lang="ts" setup>
import { icons } from '@vuesax-alpha/icons-vue/global'
</script>

<style>
.icon {
  height: 48px;
  color: #409eff;
}
svg {
  color: #000;
}
path {
  fill: currentColor;
}
</style>
