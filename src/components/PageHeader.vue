<template>
  <div class="page-header">
    <div v-if="breadcrumbs?.length" class="page-header-breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="(item, i) in breadcrumbs" :key="i">
          <router-link v-if="item.path" :to="item.path">{{ item.label }}</router-link>
          <span v-else>{{ item.label }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div class="page-header-title-row">
      <div class="flex items-center">
        <h1 class="page-header-title" :class="{ 'title-hoverable': hoverable }">
          <slot name="title">{{ title }}</slot>
        </h1>
        <slot name="title-suffix" />
      </div>
      <div v-if="$slots.extra" class="page-header-extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="page-header-border" />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  breadcrumbs: {
    type: Array,
    default: () => [],
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.page-header {
  background: #fff;
  padding: 16px 24px;
  margin-bottom: 0;
}

.page-header-breadcrumb {
  margin-bottom: 8px;
}

.page-header-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.page-header-extra {
  flex-shrink: 0;
}

.title-hoverable {
  cursor: pointer;
  transition: color 0.2s;
}

.title-hoverable:hover {
  color: #1677ff;
}

.page-header-border {
  margin-top: 16px;
  border-bottom: 1px solid #f0f0f0;
}
</style>
