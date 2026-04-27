export type WaterAccountContainer = "plastic-bottle" | "can" | "cup" | "other";

export type WaterIntakeMode = "exact" | "estimated";

export interface WaterAccountRecord {
  id: string;
  container: WaterAccountContainer;
  brand: string;
  initialWaterMl: number;
  remainingWaterMl: number;
  location: string;
  startTimeHours: number;
  createdAt: string;
}

export interface DailyWaterGoalRecord {
  goalDate: string;
  targetMl: number;
  updatedAt: string;
}

export interface WaterIntakeRecord {
  id: string;
  recordDate: string;
  accountId: string;
  accountBrand: string;
  accountContainer: WaterAccountContainer;
  consumedMl: number;
  mode: WaterIntakeMode;
  note: string | null;
  occurredAt: string;
  sourceRemainingBeforeMl: number;
  sourceRemainingAfterMl: number;
}

export interface CreateWaterAccountInput {
  id: string;
  container: WaterAccountContainer;
  brand: string;
  initialWaterMl: number;
  remainingWaterMl: number;
  location: string;
  startTimeHours: number;
  createdAt?: string;
}

export interface UpdateWaterAccountInput {
  container?: WaterAccountContainer;
  brand?: string;
  initialWaterMl?: number;
  remainingWaterMl?: number;
  location?: string;
  startTimeHours?: number;
}

export interface SaveDailyWaterGoalInput {
  goalDate: string;
  targetMl: number;
}

export interface RecordWaterIntakeInput {
  id: string;
  recordDate: string;
  accountId: string;
  requestedConsumedMl: number;
  mode: WaterIntakeMode;
  note?: string | null;
  occurredAt?: string;
}

export interface RecordWaterIntakeResult {
  record: WaterIntakeRecord;
  updatedAccount: WaterAccountRecord;
}
