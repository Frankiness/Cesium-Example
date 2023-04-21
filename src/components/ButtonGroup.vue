<template>
  <div class="group">
    <div class="inner"><slot></slot></div>
  </div>
</template>
<script></script>
<style scoped>
.group {
  position: absolute;
  padding: 10px;
  z-index: 9999 !important;
  border-bottom: 1px solid #008aff70;
  border-left: 1px solid #008aff70;
  border-right: 1px solid #008aff70;
  box-shadow: 0 4px 15px 1px #02213bb3;
  border-radius: 0;
  background-size: 1px 10px, 10px 1px, 1px 10px, 10px 1px;
  background-color: rgba(23, 49, 71, 0.8) !important;
}
.inner {
  display: inline-flex;
  gap: 8px;
}
</style>
