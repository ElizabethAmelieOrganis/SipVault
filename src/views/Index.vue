<template>
  <div class="Index-Container">
    <Pop
      v-model="showStartupPop"
      :title="databasePopupTitle"
      :status-color="databaseStatusColor"
      :message="databaseStatusMessage"
    />
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
    <div class="Index-Main">
      <div class="Index-MainSurface">
        <RouterView></RouterView>
      </div>
    </div>
    <nav class="Index-Navigation" aria-label="Primary navigation">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="Navigation-Link"
        active-class="is-active"
        exact-active-class="is-active"
      >
        <component :is="item.icon" class="Navigation-Link__Icon" />
        <span class="Navigation-Link__Text">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { GlassWater, LayoutDashboard } from "@lucide/vue";
import { RouterLink, RouterView } from "vue-router";
import Pop from "../components/pop.vue";
import { databaseStatusColor, databaseStatusRef } from "../database/status";

const showStartupPop = ref(false);
let hasShownStartupPop = false;

const navigationItems = [
  {
    name: "DashBoard",
    label: "DashBoard",
    icon: LayoutDashboard,
  },
  {
    name: "Accounts",
    label: "Accounts",
    icon: GlassWater,
  },
] as const;

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

const databaseStatusMessage = computed(() => {
  switch (databaseStatusRef.value) {
    case "connected":
      return "Database connection established. SipVault is ready.";
    case "disconnected":
      return "Database initialization failed. Check the service or configuration.";
    case "unsupported":
      return "Database initialization is not supported in this environment.";
    default:
      return "Checking the database connection status.";
  }
});

const databasePopupTitle = computed(() => {
  switch (databaseStatusRef.value) {
    case "connected":
      return "Database Connected";
    case "disconnected":
      return "Database Unavailable";
    case "unsupported":
      return "Database Unsupported";
    default:
      return "Checking Database";
  }
});

watch(
  () => databaseStatusRef.value,
  (status) => {
    if (status === "pending" || hasShownStartupPop) {
      return;
    }

    hasShownStartupPop = true;
    showStartupPop.value = true;
  },
  { immediate: true },
);
</script>
<style scoped>
.Index-Container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--color-card);
  padding: 1% 1%;
}
.Index-Header {
  display: flex;
  position: relative;
  flex: 1;
  background-color: var(--color-card);
  border-radius: 15px;
  align-items: center;
  padding: 0 2%;
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
  min-height: 0;
  flex: 12;
  margin-top: 1%;
}

.Index-MainSurface {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(248, 248, 248, 0.98)
  );
  border-radius: 22px 22px 0 0;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
  padding: 14px;
  overflow-x: hidden;
  overflow-y: auto;
}
.Index-Navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 64px;
  flex: 1.05;
  min-height: 68px;
  background-color: var(--color-card);
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
  padding: 6px 1.5%;

  .Navigation-Link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 72px;
    color: #9b9b9b;
    font-family: "JetBrains Mono";
    font-size: 0.72rem;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  .Navigation-Link__Icon {
    width: 17px;
    height: 17px;
    stroke-width: 2.1;
  }

  .Navigation-Link__Text {
    line-height: 1;
  }

  .Navigation-Link.is-active {
    color: var(--color-text-black);
  }
}

@media (max-width: 640px) {
  .Index-MainSurface {
    border-radius: 18px 18px 0 0;
    padding: 10px;
  }

  .Index-Navigation {
    gap: 30%;
    min-height: 64px;
  }
}
</style>
