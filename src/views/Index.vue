<template>
  <div class="Index-Container">
    <div class="Index-Header">
      <div class="Production-Info">
        <img src="../assets/images/logo.svg" alt="LOGO" />
        <div class="Production-Name">SipVault</div>
      </div>
      <div
        class="Database-Status"
        :style="{ '--status-color': databaseStatusColor }"
      >
        <span class="Database-Status__Dot"></span>
        <span class="Database-Status__Text">{{ databaseStatusText }}</span>
      </div>
    </div>
    <div class="Index-Main"><RouterView></RouterView></div>
    <div class="Index-Navigation"></div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { RouterView } from "vue-router";
import { databaseStatusColor, databaseStatusRef } from "../database/status";

const databaseStatusText = computed(() => {
  switch (databaseStatusRef.value) {
    case "connected":
      return "Connected";
    case "disconnected":
      return "Disconnected";
    case "unsupported":
      return "Unsupported";
    default:
      return "Connecting";
  }
});
</script>
<style scoped>
.Index-Container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--color-background);
  padding: 1% 2%;
}
.Index-Header {
  display: flex;
  position: relative;
  flex: 1;
  background-color: var(--color-card);
  border-radius: 15px;
  align-items: center;
  padding: 0 1%;
  justify-content: space-between;

  .Production-Info {
    display: flex;
    align-items: center;
    gap: 3px;

    .Production-Name {
      font-size: 1rem;
      font-weight: bold;
      color: var(--color-text-black);
      font-family: "JetBrains Mono";
    }
  }

  .Database-Status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;

    .Database-Status__Dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--status-color);
      box-shadow: 0 0 0 4px
        color-mix(in srgb, var(--status-color) 18%, transparent);
    }

    .Database-Status__Text {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--status-color);
      font-family: "JetBrains Mono";
      letter-spacing: 0.06em;
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
