<template>
  <Teleport to="body">
    <Transition name="pop-slide-down">
      <div v-if="modelValue" class="Pop-Wrap">
        <div class="Pop-Card" :style="{ '--status-color': statusColor }">
          <div class="Pop-TopRow">
            <div class="Pop-Heading">
              <span class="Pop-Status__Dot"></span>
              <p class="Pop-Title">{{ title }}</p>
            </div>
            <button
              class="Pop-Close"
              type="button"
              aria-label="Close notification"
              @click="close"
            >
              ×
            </button>
          </div>
          <p class="Pop-Message">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";

interface Props {
  modelValue: boolean;
  title: string;
  message: string;
  statusColor: string;
  autoCloseMs?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoCloseMs: 4500,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

let closeTimer: ReturnType<typeof setTimeout> | null = null;

function clearCloseTimer() {
  if (closeTimer === null) {
    return;
  }

  clearTimeout(closeTimer);
  closeTimer = null;
}

function close() {
  clearCloseTimer();
  emit("update:modelValue", false);
  emit("close");
}

function scheduleClose() {
  clearCloseTimer();

  if (props.autoCloseMs <= 0) {
    return;
  }

  closeTimer = setTimeout(() => {
    close();
  }, props.autoCloseMs);
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      clearCloseTimer();
      return;
    }

    scheduleClose();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearCloseTimer();
});
</script>

<style scoped>
.Pop-Wrap {
  position: fixed;
  top: 18px;
  left: 50%;
  z-index: 999;
  width: min(460px, calc(100vw - 24px));
  transform: translateX(-50%);
  pointer-events: none;
}

.Pop-Card {
  pointer-events: auto;
  background-color: var(--color-card);
  border-radius: 18px;
  padding: 14px 18px 16px;
  box-shadow: 0 14px 32px rgba(50, 51, 43, 0.14);
  border: 1px solid color-mix(in srgb, var(--status-color) 16%, #ffffff);
}

.Pop-TopRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.Pop-Heading {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.Pop-Close {
  flex-shrink: 0;
  font-size: 1.35rem;
  line-height: 1;
  font-weight: 500;
  color: color-mix(in srgb, var(--color-text-black) 72%, transparent);
}

.Pop-Status__Dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--status-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--status-color) 18%, transparent);
}

.Pop-Title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-black);
  font-family: "JetBrains Mono";
  letter-spacing: 0.02em;
}

.Pop-Message {
  margin-top: 8px;
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--color-text-black) 78%, transparent);
}

.pop-slide-down-enter-active,
.pop-slide-down-leave-active {
  transition:
    transform 0.26s ease,
    opacity 0.26s ease;
}

.pop-slide-down-enter-from,
.pop-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

@media (max-width: 640px) {
  .Pop-Wrap {
    top: 12px;
    width: min(460px, calc(100vw - 16px));
  }

  .Pop-Card {
    padding: 12px 14px 16px;
  }
}
</style>
