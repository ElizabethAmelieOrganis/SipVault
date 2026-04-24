import { computed, readonly, ref } from "vue";

export type DatabaseStatus = "pending" | "connected" | "disconnected" | "unsupported";

const databaseStatus = ref<DatabaseStatus>("pending");

const databaseStatusColorMap: Record<DatabaseStatus, string> = {
  pending: "var(--color-status-pending)",
  connected: "var(--color-status-active)",
  disconnected: "var(--color-status-inactive)",
  unsupported: "var(--color-status-inactive)",
};

export const databaseStatusRef = readonly(databaseStatus);

export const databaseStatusColor = computed(
  () => databaseStatusColorMap[databaseStatus.value],
);

export function setDatabaseStatus(status: DatabaseStatus) {
  databaseStatus.value = status;
}
