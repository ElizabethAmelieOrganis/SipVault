import { readStorage, writeStorage } from "@/services/storage";
import type {
  CreateWaterAccountInput,
  DailyWaterGoalRecord,
  RecordWaterIntakeInput,
  RecordWaterIntakeResult,
  SaveDailyWaterGoalInput,
  UpdateWaterAccountInput,
  WaterAccountRecord,
  WaterIntakeRecord,
} from "@/types/water";
import { normalizeInteger } from "@/utils/water";

const STORAGE_KEYS = {
  accounts: "sipvault:accounts",
  dailyGoals: "sipvault:daily-goals",
  intakeRecords: "sipvault:intake-records",
} as const;

function sortAccounts(accounts: WaterAccountRecord[]) {
  return [...accounts].sort((left, right) => {
    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}

function sortRecords(records: WaterIntakeRecord[]) {
  return [...records].sort((left, right) => {
    return new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime();
  });
}

function getStoredAccounts(): WaterAccountRecord[] {
  const accounts = readStorage<WaterAccountRecord[]>(STORAGE_KEYS.accounts, []);
  return Array.isArray(accounts) ? sortAccounts(accounts) : [];
}

function setStoredAccounts(accounts: WaterAccountRecord[]) {
  writeStorage(STORAGE_KEYS.accounts, sortAccounts(accounts));
}

function getStoredDailyGoals(): Record<string, DailyWaterGoalRecord> {
  const goals = readStorage<Record<string, DailyWaterGoalRecord>>(
    STORAGE_KEYS.dailyGoals,
    {},
  );
  return goals && typeof goals === "object" ? goals : {};
}

function setStoredDailyGoals(goals: Record<string, DailyWaterGoalRecord>) {
  writeStorage(STORAGE_KEYS.dailyGoals, goals);
}

function getStoredRecords(): WaterIntakeRecord[] {
  const records = readStorage<WaterIntakeRecord[]>(STORAGE_KEYS.intakeRecords, []);
  return Array.isArray(records) ? sortRecords(records) : [];
}

function setStoredRecords(records: WaterIntakeRecord[]) {
  writeStorage(STORAGE_KEYS.intakeRecords, sortRecords(records));
}

export function listWaterAccounts(): WaterAccountRecord[] {
  return getStoredAccounts();
}

export function getWaterAccountById(id: string): WaterAccountRecord | null {
  return getStoredAccounts().find((account) => account.id === id) ?? null;
}

export function createWaterAccount(input: CreateWaterAccountInput): WaterAccountRecord {
  const nextAccount: WaterAccountRecord = {
    id: input.id,
    container: input.container,
    brand: input.brand,
    initialWaterMl: normalizeInteger(input.initialWaterMl),
    remainingWaterMl: normalizeInteger(input.remainingWaterMl),
    location: input.location,
    startTimeHours: normalizeInteger(input.startTimeHours),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  const accounts = getStoredAccounts();
  setStoredAccounts([nextAccount, ...accounts.filter((account) => account.id !== nextAccount.id)]);
  return nextAccount;
}

export function updateWaterAccount(
  id: string,
  input: UpdateWaterAccountInput,
): WaterAccountRecord {
  const accounts = getStoredAccounts();
  const current = accounts.find((account) => account.id === id);

  if (!current) {
    throw new Error("未找到要更新的水源。");
  }

  const updatedAccount: WaterAccountRecord = {
    ...current,
    ...input,
    initialWaterMl: normalizeInteger(input.initialWaterMl ?? current.initialWaterMl),
    remainingWaterMl: normalizeInteger(
      input.remainingWaterMl ?? current.remainingWaterMl,
    ),
    startTimeHours: normalizeInteger(input.startTimeHours ?? current.startTimeHours),
  };

  setStoredAccounts(
    accounts.map((account) => (account.id === id ? updatedAccount : account)),
  );

  return updatedAccount;
}

export function deleteWaterAccount(id: string): boolean {
  const accounts = getStoredAccounts();
  const nextAccounts = accounts.filter((account) => account.id !== id);
  setStoredAccounts(nextAccounts);
  return nextAccounts.length !== accounts.length;
}

export function getDailyWaterGoal(goalDate: string): DailyWaterGoalRecord | null {
  const goals = getStoredDailyGoals();
  return goals[goalDate] ?? null;
}

export function saveDailyWaterGoal(
  input: SaveDailyWaterGoalInput,
): DailyWaterGoalRecord {
  const nextRecord: DailyWaterGoalRecord = {
    goalDate: input.goalDate,
    targetMl: normalizeInteger(input.targetMl),
    updatedAt: new Date().toISOString(),
  };

  const goals = getStoredDailyGoals();
  goals[input.goalDate] = nextRecord;
  setStoredDailyGoals(goals);
  return nextRecord;
}

export function listWaterIntakeRecordsByDate(recordDate: string): WaterIntakeRecord[] {
  return getStoredRecords().filter((record) => record.recordDate === recordDate);
}

export function recordWaterIntake(
  input: RecordWaterIntakeInput,
): RecordWaterIntakeResult {
  const accounts = getStoredAccounts();
  const currentAccount = accounts.find((account) => account.id === input.accountId);

  if (!currentAccount) {
    throw new Error("所选水源不存在。");
  }

  const sourceRemainingBeforeMl = normalizeInteger(currentAccount.remainingWaterMl);
  const requestedConsumedMl = normalizeInteger(input.requestedConsumedMl);
  const consumedMl = Math.min(requestedConsumedMl, sourceRemainingBeforeMl);

  if (consumedMl <= 0) {
    throw new Error("当前水源已经没有可记录的剩余水量。");
  }

  const sourceRemainingAfterMl = sourceRemainingBeforeMl - consumedMl;
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const note = input.note?.trim() ? input.note.trim() : null;

  const updatedAccount: WaterAccountRecord = {
    ...currentAccount,
    remainingWaterMl: sourceRemainingAfterMl,
  };

  const record: WaterIntakeRecord = {
    id: input.id,
    recordDate: input.recordDate,
    accountId: currentAccount.id,
    accountBrand: currentAccount.brand,
    accountContainer: currentAccount.container,
    consumedMl,
    mode: input.mode,
    note,
    occurredAt,
    sourceRemainingBeforeMl,
    sourceRemainingAfterMl,
  };

  setStoredAccounts(
    accounts.map((account) => (account.id === input.accountId ? updatedAccount : account)),
  );
  setStoredRecords([record, ...getStoredRecords()]);

  return {
    record,
    updatedAccount,
  };
}
