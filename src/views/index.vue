<template>
  <div class="home">
    <Navigation />
    <router-view></router-view>
  </div>
</template>

<script setup>
import Navigation from "../components/Navigation.vue";
</script>

<style>
.home {
  display: flex;
  flex-direction: row;
}
</style>
