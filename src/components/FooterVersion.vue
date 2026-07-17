<script setup lang="ts">
const appVersion = __APP_VERSION__
const commitSha = __COMMIT_SHA__
const build = new Date(__BUILD_DATE__)
const buildLabel = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: 'short', day: '2-digit'
}).format(build)
</script>

<template>
  <footer class="version-footer">
<span>© 2026 AQRT</span>
<span aria-hidden="true">·</span>
<span>AQRT Manual</span>
    <span aria-hidden="true">·</span>
    <span>v{{ appVersion }}</span>
    <span aria-hidden="true">·</span>
    <span>{{ buildLabel }}</span>
    <span aria-hidden="true">·</span>
    <span>{{ commitSha }}</span>
  </footer>
</template>
