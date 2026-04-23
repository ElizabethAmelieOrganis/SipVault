<template>
  <div class="Index-Container">
    <div class="Index-Header">
      <div class="Production-Info">
        <img src="../assets/images/logo.svg" alt="LOGO" />
        <div class="Production-Name">SipVault</div>
      </div>
    </div>
    <div class="Index-Main"><RouterView></RouterView></div>
    <div class="Index-Navigation"></div>
  </div>
</template>
<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
<style scoped>
.Index-Container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--color-background);
  padding: 2%;
}
.Index-Header {
  display: flex;
  position: relative;
  flex: 1;
  background-color: var(--color-card);
  border-radius: 15px;
  align-items: center;
  padding: 0 2%;

  .Production-Info {
    display: flex;
    align-items: center;
    gap: 3px;

    .Production-Name {
      font-size: 1rem;
      font-weight: bold;
      color: var(--color-text-black);
    }
  }
}
.Index-Main {
  flex: 12;
}
.Index-Navigation {
  flex: 1;
}
</style>
