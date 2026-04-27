import {
  containerOptions,
  estimatedOptions,
  type EstimatedOptionValue,
  type VolumeUnit,
} from "@/constants/water";
import type {
  WaterAccountContainer,
  WaterAccountRecord,
} from "@/types/water";

const weekdayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function normalizeInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.round(value), 0);
}

export function convertToMl(amount: number, unit: VolumeUnit): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return normalizeInteger(unit === "l" ? amount * 1000 : amount);
}

export function formatVolume(value: number): string {
  const normalized = normalizeInteger(value);

  if (normalized >= 1000) {
    const liters = normalized / 1000;
    const text = Number.isInteger(liters) ? liters.toString() : liters.toFixed(1);
    return `${text} L`;
  }

  return `${normalized} mL`;
}

export function formatDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdayLabels[date.getDay()]}`;
}

export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatClock(value: string): string {
  const date = new Date(value);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatCreatedAt(value: string): string {
  const date = new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

export function createAccountId(): string {
  return `WTR-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export function createRecordId(): string {
  return `DRK-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export function getContainerOption(value: WaterAccountContainer) {
  return (
    containerOptions.find((option) => option.value === value) ?? containerOptions[0]
  );
}

export function getHoursSinceCreated(account: WaterAccountRecord, now: number): number {
  const createdAtTime = new Date(account.createdAt).getTime();
  const diffHours = Math.floor((now - createdAtTime) / (1000 * 60 * 60));
  return Math.max(diffHours + account.startTimeHours, 0);
}

export function getAccountStatusInfo(account: WaterAccountRecord, now: number) {
  const hours = getHoursSinceCreated(account, now);

  if (hours <= 12) {
    return {
      label: "适合继续饮用",
      tone: "success" as const,
    };
  }

  if (hours <= 24) {
    return {
      label: "建议尽快喝完",
      tone: "warning" as const,
    };
  }

  return {
    label: "建议更换水源",
    tone: "danger" as const,
  };
}

export function getRemainingWaterPercent(account: WaterAccountRecord): number {
  if (account.initialWaterMl <= 0) {
    return 0;
  }

  const percent = (account.remainingWaterMl / account.initialWaterMl) * 100;
  return Math.min(Math.max(percent, 0), 100);
}

export function getEstimatedConsumedMl(
  account: WaterAccountRecord,
  option: EstimatedOptionValue,
): number {
  switch (option) {
    case "sip":
      return 70;
    case "leave-three-quarters":
      return account.remainingWaterMl * 0.25;
    case "leave-half":
      return account.remainingWaterMl * 0.5;
    case "leave-third":
      return account.remainingWaterMl * (2 / 3);
    case "leave-quarter":
      return account.remainingWaterMl * 0.75;
    case "finish":
      return account.remainingWaterMl;
    default:
      return 0;
  }
}

export function getEstimatedNote(option: EstimatedOptionValue): string {
  return (
    estimatedOptions.find((item) => item.value === option)?.label ?? "估算饮水"
  );
}
