<template>
  <section class="Dashboard-Page">
    <header class="Dashboard-Header">
      <h1 class="Dashboard-Header__Title">{{ todayDateLabel }}</h1>
    </header>

    <p v-if="pageError" class="Dashboard-PageError">{{ pageError }}</p>

    <div class="Dashboard-Main">
      <article class="Dashboard-BodyPanel">
        <div class="Dashboard-BodyPanel__Figure">
          <div class="Dashboard-BodyMeter">
            <svg
              class="Dashboard-BodyMeter__Svg"
              viewBox="0 0 160 280"
              aria-hidden="true"
            >
              <defs>
                <clipPath id="dashboard-body-shape">
                  <path
                    d="M80 21c12.7 0 23 10.3 23 23S92.7 67 80 67 57 56.7 57 44s10.3-23 23-23Zm-17.4 58.2a37.4 37.4 0 0 1 34.8 0l16.4 7.8c14.5 6.9 23.7 21.5 23.7 37.5v30.1c0 7.8-4.7 14.8-12 17.7l-11.1 4.5v67.1c0 8.8-7.2 16-16 16s-16-7.2-16-16v-48.2h-4.8v48.2c0 8.8-7.2 16-16 16s-16-7.2-16-16v-67.1l-11.1-4.5c-7.3-3-12-9.9-12-17.7v-30.1c0-16 9.2-30.6 23.7-37.5l16.4-7.8Z"
                  />
                </clipPath>
                <linearGradient
                  id="dashboard-body-fill"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stop-color="#9fd4ff" />
                  <stop offset="100%" stop-color="#5cabff" />
                </linearGradient>
              </defs>

              <rect
                x="0"
                y="0"
                width="160"
                height="280"
                fill="#d7dbe2"
                clip-path="url(#dashboard-body-shape)"
              />
              <rect
                x="0"
                :y="280 - bodyFillHeight"
                width="160"
                :height="bodyFillHeight"
                fill="url(#dashboard-body-fill)"
                clip-path="url(#dashboard-body-shape)"
              />
              <path
                d="M80 21c12.7 0 23 10.3 23 23S92.7 67 80 67 57 56.7 57 44s10.3-23 23-23Zm-17.4 58.2a37.4 37.4 0 0 1 34.8 0l16.4 7.8c14.5 6.9 23.7 21.5 23.7 37.5v30.1c0 7.8-4.7 14.8-12 17.7l-11.1 4.5v67.1c0 8.8-7.2 16-16 16s-16-7.2-16-16v-48.2h-4.8v48.2c0 8.8-7.2 16-16 16s-16-7.2-16-16v-67.1l-11.1-4.5c-7.3-3-12-9.9-12-17.7v-30.1c0-16 9.2-30.6 23.7-37.5l16.4-7.8Z"
                fill="none"
                stroke="rgba(50, 51, 43, 0.16)"
                stroke-width="4"
              />
            </svg>

            <div class="Dashboard-BodyMeter__Badge">
              {{
                goalProgressPercent >= 100
                  ? "Hydrated"
                  : `${goalProgressPercent}%`
              }}
            </div>
          </div>
        </div>

        <div class="Dashboard-BodyPanel__Stats">
          <button
            class="Dashboard-Metric Dashboard-Metric--goal is-clickable"
            type="button"
            :aria-label="`Edit today's goal. Current goal ${formatVolume(activeTargetMl)}`"
            @click="openGoalModal"
          >
            <div class="Dashboard-Metric__Core" role="img">
              <span class="Dashboard-Metric__Tooltip">Today's goal</span>
              <Target class="Dashboard-Metric__Icon" />
              <span class="Dashboard-Metric__Value">{{
                formatVolume(activeTargetMl)
              }}</span>
            </div>
          </button>

          <div
            class="Dashboard-Metric"
            tabindex="0"
            role="img"
            :aria-label="`Today's intake ${formatVolume(todayConsumedMl)}`"
          >
            <span class="Dashboard-Metric__Tooltip">Today's intake</span>
            <Droplets class="Dashboard-Metric__Icon" />
            <span class="Dashboard-Metric__Value">{{
              formatVolume(todayConsumedMl)
            }}</span>
          </div>
        </div>

        <div class="Dashboard-BodyPanel__Progress">
          <div class="Dashboard-BodyPanel__ProgressMeta">
            <span>{{ goalProgressPercent }}%</span>
            <span>
              {{
                remainingToGoalMl > 0
                  ? `${formatVolume(remainingToGoalMl)} to goal`
                  : "Goal reached"
              }}
            </span>
          </div>
          <div class="Dashboard-ProgressTrack">
            <div
              class="Dashboard-ProgressTrack__Fill"
              :style="{ width: `${goalProgressPercent}%` }"
            ></div>
          </div>
        </div>
      </article>

      <article class="Dashboard-RecordsPanel">
        <div class="Dashboard-RecordsPanel__Header">
          <div>
            <h2 class="Dashboard-SectionTitle">Today's Drinks</h2>
            <p class="Dashboard-SectionText">
              Time, source, and actual consumed amount for today.
            </p>
          </div>
          <button
            class="Dashboard-AddButton"
            type="button"
            :disabled="accounts.length === 0"
            @click="openRecordModal"
          >
            <Plus class="Dashboard-AddButton__Icon" />
          </button>
        </div>

        <div
          v-if="todayRecords.length === 0"
          class="Dashboard-Empty is-compact"
        >
          <div class="Dashboard-Empty__IconWrap">
            <Droplets class="Dashboard-Empty__Icon" />
          </div>
          <p class="Dashboard-Empty__Title">No drinks logged today</p>
          <p class="Dashboard-Empty__Text">
            Tap the plus button to create your first record for
            {{ todayShortDateLabel }}.
          </p>
        </div>

        <div v-else class="Dashboard-Records">
          <article
            v-for="record in todayRecords"
            :key="record.id"
            class="Dashboard-RecordCard"
          >
            <div class="Dashboard-RecordCard__Top">
              <div>
                <p class="Dashboard-RecordCard__Time">
                  {{ formatClock(record.occurredAt) }}
                </p>
                <h3 class="Dashboard-RecordCard__Title">
                  {{ record.accountBrand }}
                </h3>
              </div>
              <p class="Dashboard-RecordCard__Amount">
                {{ formatVolume(record.consumedMl) }}
              </p>
            </div>

            <div class="Dashboard-RecordCard__Bottom">
              <span>{{
                record.mode === "exact"
                  ? "Exact amount"
                  : (record.note ?? "Estimated")
              }}</span>
              <span
                >{{ formatVolume(record.sourceRemainingAfterMl) }} left</span
              >
            </div>
          </article>
        </div>
      </article>
    </div>

    <Transition name="Dashboard-Modal">
      <div v-if="isGoalModalOpen" class="Dashboard-Modal is-goal">
        <div class="Dashboard-Modal__Card Dashboard-Modal__Card--goal">
          <div class="Dashboard-Modal__Header">
            <div>
              <h2 class="Dashboard-Modal__Title">Set Daily Goal</h2>
              <p class="Dashboard-Modal__Subtitle">
                Choose how much water you want to drink today.
              </p>
            </div>
            <button
              class="Dashboard-Modal__Close"
              type="button"
              @click="closeGoalModal"
            >
              <X />
            </button>
          </div>

          <form class="Dashboard-GoalForm" @submit.prevent="saveGoal">
            <div class="Dashboard-GoalForm__Row">
              <label class="Dashboard-Field">
                <span class="Dashboard-Field__Label">Daily goal</span>
                <input
                  v-model.number="goalForm.amount"
                  class="Dashboard-Field__Input"
                  type="number"
                  min="0"
                  :step="goalForm.unit === 'l' ? 0.1 : 50"
                  placeholder="2"
                />
              </label>

              <label class="Dashboard-Field Dashboard-Field--unit">
                <span class="Dashboard-Field__Label">Unit</span>
                <select v-model="goalForm.unit" class="Dashboard-Field__Input">
                  <option value="l">L</option>
                  <option value="ml">mL</option>
                </select>
              </label>

              <button
                class="Dashboard-Button is-primary"
                type="submit"
                :disabled="isSavingGoal"
              >
                {{ isSavingGoal ? "Saving..." : "Save" }}
              </button>
            </div>

            <div class="Dashboard-GoalPresets">
              <button
                v-for="preset in goalPresets"
                :key="preset"
                class="Dashboard-Chip"
                type="button"
                @click="applyGoalPreset(preset)"
              >
                {{ formatVolume(preset) }}
              </button>
            </div>

            <p
              v-if="goalError"
              class="Dashboard-FormError Dashboard-Field--full"
            >
              {{ goalError }}
            </p>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="Dashboard-Modal">
      <div v-if="isRecordModalOpen" class="Dashboard-Modal">
        <div class="Dashboard-Modal__Card">
          <div class="Dashboard-Modal__Header">
            <div>
              <h2 class="Dashboard-Modal__Title">Add Water Record</h2>
              <p class="Dashboard-Modal__Subtitle">
                Pick a source and the system will update its remaining water
                automatically.
              </p>
            </div>
            <button
              class="Dashboard-Modal__Close"
              type="button"
              @click="closeRecordModal"
            >
              <X />
            </button>
          </div>

          <form class="Dashboard-Form" @submit.prevent="submitRecord">
            <label class="Dashboard-Field">
              <span class="Dashboard-Field__Label">Time</span>
              <input
                class="Dashboard-Field__Input is-readonly"
                type="text"
                :value="currentTimeLabel"
                readonly
              />
            </label>

            <div class="Dashboard-Field">
              <span class="Dashboard-Field__Label">Source</span>
              <div class="Dashboard-Select">
                <button
                  class="Dashboard-Select__Trigger"
                  type="button"
                  @click="toggleSourceMenu"
                >
                  <template v-if="selectedAccount">
                    <span class="Dashboard-Select__Value">
                      <component
                        :is="getContainerOption(selectedAccount.container).icon"
                        class="Dashboard-Select__Icon"
                      />
                      <span>
                        <strong>{{ selectedAccount.brand }}</strong>
                        <small>
                          {{ getAccountStatusLabel(selectedAccount) }} |
                          {{ formatVolume(selectedAccount.remainingWaterMl) }}
                          left
                        </small>
                      </span>
                    </span>
                  </template>
                  <span v-else class="Dashboard-Select__Placeholder"
                    >Choose a water source</span
                  >
                  <ChevronDown class="Dashboard-Select__Chevron" />
                </button>

                <div v-if="isSourceMenuOpen" class="Dashboard-Select__Menu">
                  <button
                    v-for="account in accounts"
                    :key="account.id"
                    class="Dashboard-Select__Option"
                    type="button"
                    :disabled="account.remainingWaterMl <= 0"
                    @click="selectAccount(account.id)"
                  >
                    <component
                      :is="getContainerOption(account.container).icon"
                      class="Dashboard-Select__Icon"
                    />
                    <span>
                      <strong>{{ account.brand }}</strong>
                      <small>
                        {{ getAccountStatusLabel(account) }} |
                        {{ formatVolume(account.remainingWaterMl) }} left
                      </small>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div class="Dashboard-Field Dashboard-Field--full">
              <span class="Dashboard-Field__Label">Mode</span>
              <div class="Dashboard-Segment">
                <button
                  class="Dashboard-Segment__Item"
                  :class="{ 'is-active': recordForm.mode === 'exact' }"
                  type="button"
                  @click="recordForm.mode = 'exact'"
                >
                  Exact
                </button>
                <button
                  class="Dashboard-Segment__Item"
                  :class="{ 'is-active': recordForm.mode === 'estimated' }"
                  type="button"
                  @click="recordForm.mode = 'estimated'"
                >
                  Estimated
                </button>
              </div>
            </div>

            <template v-if="recordForm.mode === 'exact'">
              <label class="Dashboard-Field">
                <span class="Dashboard-Field__Label">Amount</span>
                <input
                  v-model.number="recordForm.exactAmount"
                  class="Dashboard-Field__Input"
                  type="number"
                  min="0"
                  :step="recordForm.exactUnit === 'l' ? 0.05 : 10"
                  placeholder="250"
                />
              </label>

              <label class="Dashboard-Field">
                <span class="Dashboard-Field__Label">Unit</span>
                <select
                  v-model="recordForm.exactUnit"
                  class="Dashboard-Field__Input"
                >
                  <option value="ml">mL</option>
                  <option value="l">L</option>
                </select>
              </label>
            </template>

            <div v-else class="Dashboard-Field Dashboard-Field--full">
              <span class="Dashboard-Field__Label">Estimated options</span>
              <div class="Dashboard-Options">
                <button
                  v-for="option in estimatedOptions"
                  :key="option.value"
                  class="Dashboard-Option"
                  :class="{
                    'is-active': recordForm.estimatedOption === option.value,
                  }"
                  type="button"
                  @click="recordForm.estimatedOption = option.value"
                >
                  <strong>{{ option.label }}</strong>
                  <small>{{ option.description }}</small>
                </button>
              </div>
            </div>

            <div class="Dashboard-Preview Dashboard-Field--full">
              <p class="Dashboard-Preview__Label">Actual recorded amount</p>
              <p class="Dashboard-Preview__Value">
                {{
                  previewConsumedMl > 0
                    ? formatVolume(previewConsumedMl)
                    : "0 mL"
                }}
              </p>
              <p class="Dashboard-Preview__Text">
                <template v-if="selectedAccount">
                  {{
                    isPreviewClamped
                      ? `This exceeds the remaining water, so it will be capped at ${formatVolume(selectedAccount.remainingWaterMl)}.`
                      : `After saving, ${selectedAccount.brand} will have ${formatVolume(previewRemainingMl)} left.`
                  }}
                </template>
                <template v-else
                  >Pick a source to preview the final recorded amount.</template
                >
              </p>
            </div>

            <p
              v-if="recordError"
              class="Dashboard-FormError Dashboard-Field--full"
            >
              {{ recordError }}
            </p>

            <div class="Dashboard-Form__Actions">
              <button
                class="Dashboard-Button is-secondary"
                type="button"
                @click="closeRecordModal"
              >
                Cancel
              </button>
              <button
                class="Dashboard-Button is-primary"
                type="submit"
                :disabled="isSavingRecord || previewConsumedMl <= 0"
              >
                {{ isSavingRecord ? "Saving..." : "Save Record" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import {
  BottleWine,
  ChevronDown,
  Droplets,
  GlassWater,
  Package,
  Plus,
  Soup,
  Target,
  X,
} from "@lucide/vue";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  canUseDatabase,
  getDailyWaterGoal,
  listWaterAccounts,
  listWaterIntakeRecordsByDate,
  recordWaterIntake,
  saveDailyWaterGoal,
  type WaterAccountContainer as ContainerType,
  type WaterAccountRecord as WaterAccount,
  type WaterIntakeMode,
  type WaterIntakeRecord,
} from "../../database";

type VolumeUnit = "ml" | "l";
type EstimatedOptionValue =
  | "sip"
  | "leave-three-quarters"
  | "leave-half"
  | "leave-third"
  | "leave-quarter"
  | "finish";

interface GoalFormState {
  amount: number;
  unit: VolumeUnit;
}

interface RecordFormState {
  accountId: string;
  mode: WaterIntakeMode;
  exactAmount: number;
  exactUnit: VolumeUnit;
  estimatedOption: EstimatedOptionValue;
}

const containerOptions = [
  {
    value: "plastic-bottle",
    label: "Plastic Bottle",
    icon: BottleWine,
  },
  {
    value: "can",
    label: "Can",
    icon: Soup,
  },
  {
    value: "cup",
    label: "Cup",
    icon: GlassWater,
  },
  {
    value: "other",
    label: "Other",
    icon: Package,
  },
] as const;

const estimatedOptions = [
  {
    value: "sip",
    label: "A sip",
    description: "Average mouthful, around 70 mL.",
  },
  {
    value: "leave-three-quarters",
    label: "Leave 3/4",
    description: "Record drinking one quarter of what is left.",
  },
  {
    value: "leave-half",
    label: "Leave 1/2",
    description: "Record drinking half of the current remaining water.",
  },
  {
    value: "leave-third",
    label: "Leave 1/3",
    description: "Record drinking until one third remains.",
  },
  {
    value: "leave-quarter",
    label: "Leave 1/4",
    description: "Record drinking until one quarter remains.",
  },
  {
    value: "finish",
    label: "Finish it",
    description: "Drink everything left in the container.",
  },
] as const;

const goalPresets = [1500, 2000, 2500, 3000] as const;

const accounts = ref<WaterAccount[]>([]);
const intakeRecords = ref<WaterIntakeRecord[]>([]);
const pageError = ref("");
const goalError = ref("");
const recordError = ref("");
const isSavingGoal = ref(false);
const isSavingRecord = ref(false);
const isGoalModalOpen = ref(false);
const isRecordModalOpen = ref(false);
const isSourceMenuOpen = ref(false);
const now = ref(Date.now());
const activeGoalMl = ref(2000);

const goalForm = reactive<GoalFormState>({
  amount: 2,
  unit: "l",
});

const recordForm = reactive<RecordFormState>({
  accountId: "",
  mode: "exact",
  exactAmount: 250,
  exactUnit: "ml",
  estimatedOption: "sip",
});

let nowTimer: ReturnType<typeof setInterval> | null = null;

const todayDateKey = computed(() => formatDateKey(now.value));
const todayDateLabel = computed(() =>
  new Date(now.value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
);
const todayShortDateLabel = computed(() =>
  new Date(now.value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
);
const currentTimeLabel = computed(() =>
  new Date(now.value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
);
const todayRecords = computed(() => intakeRecords.value);
const todayConsumedMl = computed(() =>
  todayRecords.value.reduce((total, record) => total + record.consumedMl, 0),
);
const activeTargetMl = computed(() => Math.max(activeGoalMl.value, 0));
const rawGoalProgress = computed(() => {
  if (activeTargetMl.value <= 0) {
    return 0;
  }

  return (todayConsumedMl.value / activeTargetMl.value) * 100;
});
const goalProgressPercent = computed(() =>
  Math.min(Math.max(Math.round(rawGoalProgress.value), 0), 100),
);
const bodyFillHeight = computed(() => (280 * goalProgressPercent.value) / 100);
const remainingToGoalMl = computed(() =>
  Math.max(activeTargetMl.value - todayConsumedMl.value, 0),
);
const selectedAccount = computed(
  () =>
    accounts.value.find((account) => account.id === recordForm.accountId) ??
    null,
);
const requestedConsumedMl = computed(() => {
  if (!selectedAccount.value) {
    return 0;
  }

  if (recordForm.mode === "exact") {
    return convertToMl(recordForm.exactAmount, recordForm.exactUnit);
  }

  return getEstimatedConsumedMl(
    selectedAccount.value,
    recordForm.estimatedOption,
  );
});
const previewConsumedMl = computed(() => {
  if (!selectedAccount.value) {
    return 0;
  }

  return Math.min(
    normalizeInteger(requestedConsumedMl.value),
    selectedAccount.value.remainingWaterMl,
  );
});
const previewRemainingMl = computed(() => {
  if (!selectedAccount.value) {
    return 0;
  }

  return Math.max(
    selectedAccount.value.remainingWaterMl - previewConsumedMl.value,
    0,
  );
});
const isPreviewClamped = computed(() => {
  if (!selectedAccount.value) {
    return false;
  }

  return (
    normalizeInteger(requestedConsumedMl.value) >
    selectedAccount.value.remainingWaterMl
  );
});

function formatDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createRecordId(): string {
  return `DRK-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function normalizeInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.round(value), 0);
}

function convertToMl(amount: number, unit: VolumeUnit): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return normalizeInteger(unit === "l" ? amount * 1000 : amount);
}

function syncGoalForm(targetMl: number) {
  if (targetMl >= 1000 && targetMl % 50 === 0) {
    goalForm.amount = Number((targetMl / 1000).toFixed(2));
    goalForm.unit = "l";
    return;
  }

  goalForm.amount = targetMl;
  goalForm.unit = "ml";
}

function applyGoalPreset(targetMl: number) {
  syncGoalForm(targetMl);
  goalError.value = "";
}

function openGoalModal() {
  goalError.value = "";
  isGoalModalOpen.value = true;
}

function closeGoalModal() {
  isGoalModalOpen.value = false;
  goalError.value = "";
}

function formatVolume(value: number): string {
  const normalized = normalizeInteger(value);

  if (normalized >= 1000) {
    const liters = normalized / 1000;
    const litersText = Number.isInteger(liters)
      ? liters.toString()
      : liters.toFixed(1);
    return `${litersText} L`;
  }

  return `${normalized} mL`;
}

function formatClock(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getContainerOption(value: ContainerType) {
  return (
    containerOptions.find((option) => option.value === value) ??
    containerOptions[0]
  );
}

function getPreferredAccountId(): string {
  return (
    accounts.value.find((account) => account.remainingWaterMl > 0)?.id ??
    accounts.value[0]?.id ??
    ""
  );
}

function ensureSelectedAccount() {
  if (
    recordForm.accountId &&
    accounts.value.some((account) => account.id === recordForm.accountId)
  ) {
    return;
  }

  recordForm.accountId = getPreferredAccountId();
}

function getHoursSinceCreated(account: WaterAccount): number {
  const createdAtTime = new Date(account.createdAt).getTime();
  const diffHours = Math.floor((now.value - createdAtTime) / (1000 * 60 * 60));
  return Math.max(diffHours + account.startTimeHours, 0);
}

function getAccountStatusLabel(account: WaterAccount): string {
  const hours = getHoursSinceCreated(account);

  if (hours <= 12) {
    return "Safe to drink";
  }

  if (hours <= 24) {
    return "Use soon";
  }

  return "Replace it";
}

function getEstimatedConsumedMl(
  account: WaterAccount,
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

function getEstimatedNote(option: EstimatedOptionValue): string {
  return (
    estimatedOptions.find((item) => item.value === option)?.label ??
    "Estimated drink"
  );
}

function resetRecordForm() {
  recordForm.accountId = getPreferredAccountId();
  recordForm.mode = "exact";
  recordForm.exactAmount = 250;
  recordForm.exactUnit = "ml";
  recordForm.estimatedOption = "sip";
  recordError.value = "";
  isSourceMenuOpen.value = false;
}

function openRecordModal() {
  resetRecordForm();
  isRecordModalOpen.value = true;
}

function closeRecordModal() {
  isRecordModalOpen.value = false;
  isSourceMenuOpen.value = false;
  recordError.value = "";
}

function toggleSourceMenu() {
  isSourceMenuOpen.value = !isSourceMenuOpen.value;
}

function selectAccount(accountId: string) {
  recordForm.accountId = accountId;
  isSourceMenuOpen.value = false;
}

async function loadAccounts() {
  if (!canUseDatabase()) {
    accounts.value = [];
    ensureSelectedAccount();
    return;
  }

  const nextAccounts = await listWaterAccounts();
  accounts.value = nextAccounts;
  ensureSelectedAccount();
}

async function loadTodayData() {
  if (!canUseDatabase()) {
    intakeRecords.value = [];
    activeGoalMl.value = convertToMl(goalForm.amount, goalForm.unit) || 2000;
    return;
  }

  const [goal, records] = await Promise.all([
    getDailyWaterGoal(todayDateKey.value),
    listWaterIntakeRecordsByDate(todayDateKey.value),
  ]);

  intakeRecords.value = records;
  activeGoalMl.value = goal?.targetMl ?? 2000;
  syncGoalForm(activeGoalMl.value);
}

async function loadDashboard() {
  try {
    await Promise.all([loadAccounts(), loadTodayData()]);
    pageError.value = "";
  } catch (error) {
    console.error("Failed to load dashboard", error);
    pageError.value = "Failed to load dashboard data.";
  }
}

async function saveGoal() {
  const targetMl = convertToMl(goalForm.amount, goalForm.unit);

  if (targetMl <= 0) {
    goalError.value = "Please enter a valid daily target.";
    return;
  }

  isSavingGoal.value = true;

  try {
    if (canUseDatabase()) {
      await saveDailyWaterGoal({
        goalDate: todayDateKey.value,
        targetMl,
      });
    }

    activeGoalMl.value = targetMl;
    goalError.value = "";
    isGoalModalOpen.value = false;
    pageError.value = "";
  } catch (error) {
    console.error("Failed to save daily goal", error);
    goalError.value = "Failed to save today's goal.";
  } finally {
    isSavingGoal.value = false;
  }
}

async function submitRecord() {
  if (!selectedAccount.value) {
    recordError.value = "Please choose a water source first.";
    return;
  }

  const requestedMl = normalizeInteger(requestedConsumedMl.value);

  if (requestedMl <= 0) {
    recordError.value = "Please enter a valid drinking amount.";
    return;
  }

  isSavingRecord.value = true;

  try {
    const result = canUseDatabase()
      ? await recordWaterIntake({
          id: createRecordId(),
          recordDate: todayDateKey.value,
          accountId: selectedAccount.value.id,
          requestedConsumedMl: requestedMl,
          mode: recordForm.mode,
          note:
            recordForm.mode === "estimated"
              ? getEstimatedNote(recordForm.estimatedOption)
              : null,
        })
      : {
          record: {
            id: createRecordId(),
            recordDate: todayDateKey.value,
            accountId: selectedAccount.value.id,
            accountBrand: selectedAccount.value.brand,
            accountContainer: selectedAccount.value.container,
            consumedMl: Math.min(
              requestedMl,
              selectedAccount.value.remainingWaterMl,
            ),
            mode: recordForm.mode,
            note:
              recordForm.mode === "estimated"
                ? getEstimatedNote(recordForm.estimatedOption)
                : null,
            occurredAt: new Date().toISOString(),
            sourceRemainingBeforeMl: selectedAccount.value.remainingWaterMl,
            sourceRemainingAfterMl: Math.max(
              selectedAccount.value.remainingWaterMl -
                Math.min(requestedMl, selectedAccount.value.remainingWaterMl),
              0,
            ),
          },
          updatedAccount: {
            ...selectedAccount.value,
            remainingWaterMl: Math.max(
              selectedAccount.value.remainingWaterMl -
                Math.min(requestedMl, selectedAccount.value.remainingWaterMl),
              0,
            ),
          },
        };

    accounts.value = accounts.value.map((account) =>
      account.id === result.updatedAccount.id ? result.updatedAccount : account,
    );
    intakeRecords.value = [result.record, ...intakeRecords.value];
    closeRecordModal();
  } catch (error) {
    console.error("Failed to record water intake", error);
    recordError.value =
      error instanceof Error
        ? error.message
        : "Failed to save this drinking record.";
  } finally {
    isSavingRecord.value = false;
  }
}

watch(
  () => todayDateKey.value,
  (current, previous) => {
    if (current === previous) {
      return;
    }

    void loadTodayData();
  },
);

onMounted(() => {
  nowTimer = setInterval(() => {
    now.value = Date.now();
  }, 30000);

  void loadDashboard();
});

onBeforeUnmount(() => {
  if (nowTimer !== null) {
    clearInterval(nowTimer);
  }
});
</script>

<style scoped>
.Dashboard-Page {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
  color: var(--color-text-black);
  font-family: "JetBrains Mono";
}

.Dashboard-Header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px 2px 8px;
  text-align: center;
}

.Dashboard-Header__Title {
  font-size: 0.98rem;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.Dashboard-SectionText,
.Dashboard-RecordCard__Time,
.Dashboard-RecordCard__Bottom,
.Dashboard-Field__Label,
.Dashboard-Modal__Subtitle {
  color: color-mix(in srgb, var(--color-text-black) 65%, transparent);
  font-size: 0.8rem;
}

.Dashboard-AddButton,
.Dashboard-Button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  font-weight: 700;
}

.Dashboard-AddButton {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  background-color: var(--color-text-black);
  color: white;
}

.Dashboard-AddButton:disabled,
.Dashboard-Button:disabled,
.Dashboard-Select__Option:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.Dashboard-AddButton__Icon {
  width: 18px;
  height: 18px;
}

.Dashboard-PageError,
.Dashboard-FormError {
  border-radius: 12px;
  background-color: color-mix(in srgb, #cb3a31 10%, white);
  padding: 8px 10px;
  color: #cb3a31;
  font-size: 0.74rem;
  font-weight: 700;
}

.Dashboard-Main {
  display: grid;
  gap: 10px;
}

.Dashboard-Main {
  grid-template-columns: minmax(150px, 42%) minmax(0, 58%);
  align-items: stretch;
}

.Dashboard-BodyPanel,
.Dashboard-RecordsPanel,
.Dashboard-Modal__Card {
  border: 1px solid color-mix(in srgb, var(--color-text-black) 6%, transparent);
  border-radius: 20px;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.06);
}

.Dashboard-BodyPanel,
.Dashboard-RecordsPanel {
  padding: 12px;
  height: 100%;
}

.Dashboard-BodyPanel {
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--color-card) 94%, var(--color-background));
}

.Dashboard-BodyPanel__Figure {
  display: flex;
  justify-content: flex-start;
}

.Dashboard-BodyPanel__Stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-start;
  align-items: flex-start;
}

.Dashboard-Metric {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 8px;
  border-radius: 14px;
  background-color: color-mix(in srgb, white 82%, var(--color-background));
  justify-content: flex-start;
  text-align: left;
}

.Dashboard-Metric:focus-visible,
.Dashboard-Metric__Core:focus-visible {
  outline: 2px solid color-mix(in srgb, #5cabff 35%, transparent);
  outline-offset: 2px;
}

.Dashboard-Metric__Core {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  outline: none;
  justify-content: flex-start;
  text-align: left;
}

.Dashboard-Metric.is-clickable {
  cursor: pointer;
}

.Dashboard-Metric.is-clickable:hover {
  background-color: color-mix(in srgb, #5cabff 9%, white);
}

.Dashboard-Metric__Tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  transform: translateX(-50%) translateY(4px);
  padding: 4px 7px;
  border-radius: 999px;
  background-color: rgba(50, 51, 43, 0.9);
  color: white;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.Dashboard-Metric:hover .Dashboard-Metric__Tooltip,
.Dashboard-Metric:focus-visible .Dashboard-Metric__Tooltip,
.Dashboard-Metric__Core:hover .Dashboard-Metric__Tooltip,
.Dashboard-Metric__Core:focus-visible .Dashboard-Metric__Tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.Dashboard-Metric__Icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-black);
  flex-shrink: 0;
}

.Dashboard-Metric__Value,
.Dashboard-Preview__Value {
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-black);
}

.Dashboard-Preview__Label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text-black) 56%, transparent);
}

.Dashboard-Metric__Action {
  min-width: 38px;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  background-color: color-mix(in srgb, #5cabff 14%, white);
  color: #3278c4;
  font-size: 0.66rem;
  font-weight: 700;
  flex-shrink: 0;
}

.Dashboard-BodyPanel__Progress {
  margin-top: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.Dashboard-BodyPanel__ProgressMeta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  gap: 12px;
  color: var(--color-text-black);
  text-align: left;
}

.Dashboard-ProgressTrack {
  overflow: hidden;
  border-radius: 999px;
  background-color: rgba(130, 190, 255, 0.16);
  height: 12px;
}

.Dashboard-ProgressTrack__Fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #9fd4ff 0%, #5cabff 100%);
  transition: width 0.2s ease;
}

.Dashboard-BodyMeter {
  position: relative;
  display: flex;
  width: min(170px, 100%);
  min-width: 140px;
  align-items: center;
  justify-content: center;
}

.Dashboard-BodyMeter__Svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 12px 28px rgba(92, 171, 255, 0.16));
}

.Dashboard-BodyMeter__Badge {
  position: absolute;
  bottom: 4px;
  padding: 5px 9px;
  border-radius: 999px;
  background-color: rgba(50, 51, 43, 0.92);
  color: white;
  font-size: 0.66rem;
  font-weight: 700;
}

.Dashboard-RecordsPanel__Header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.Dashboard-RecordsPanel {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.Dashboard-SectionTitle,
.Dashboard-Modal__Title {
  font-size: 0.92rem;
}

.Dashboard-GoalForm,
.Dashboard-Form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
  margin-top: 10px;
}

.Dashboard-GoalForm {
  margin-top: 10px;
}

.Dashboard-GoalForm__Row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 78px 72px;
  gap: 8px;
  align-items: end;
}

.Dashboard-Field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.Dashboard-Field--full {
  grid-column: 1 / -1;
}

.Dashboard-Field--unit {
  min-width: 0;
}

.Dashboard-Field__Label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.Dashboard-Field__Input,
.Dashboard-Select__Trigger,
.Dashboard-Segment,
.Dashboard-Option {
  border: 1px solid color-mix(in srgb, var(--color-text-black) 10%, transparent);
  background-color: color-mix(in srgb, var(--color-background) 55%, white);
}

.Dashboard-Field__Input,
.Dashboard-Select__Trigger {
  min-height: 34px;
  width: 100%;
  border-radius: 12px;
  padding: 0 10px;
  color: var(--color-text-black);
}

.Dashboard-Field__Input:focus,
.Dashboard-Select__Trigger:focus {
  outline: 2px solid
    color-mix(in srgb, var(--color-text-black) 18%, transparent);
  outline-offset: 1px;
}

.Dashboard-Field__Input.is-readonly {
  color: color-mix(in srgb, var(--color-text-black) 68%, transparent);
}

.Dashboard-GoalPresets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.Dashboard-Chip {
  min-height: 26px;
  border-radius: 999px;
  padding: 0 10px;
  background-color: color-mix(in srgb, #5cabff 10%, white);
  color: #3278c4;
  font-size: 0.68rem;
  font-weight: 700;
}

.Dashboard-Form__Actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  grid-column: 1 / -1;
}

.Dashboard-Button {
  min-width: 76px;
  min-height: 32px;
  padding: 0 12px;
}

.Dashboard-Button.is-primary {
  background-color: var(--color-text-black);
  color: white;
}

.Dashboard-Button.is-secondary {
  background-color: color-mix(in srgb, var(--color-background) 72%, white);
}

.Dashboard-Records {
  display: grid;
  gap: 12px;
  margin-top: 10px;
  align-content: start;
  flex: 1 1 auto;
}

.Dashboard-RecordCard,
.Dashboard-Preview {
  border-radius: 16px;
  background-color: color-mix(in srgb, var(--color-background) 45%, white);
  padding: 10px;
}

.Dashboard-RecordCard__Top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.Dashboard-RecordCard__Title {
  font-size: 0.82rem;
  font-weight: 800;
}

.Dashboard-RecordCard__Amount {
  font-size: 0.76rem;
  font-weight: 800;
}

.Dashboard-RecordCard__Bottom,
.Dashboard-Preview__Text {
  margin-top: 8px;
  font-size: 0.7rem;
  color: color-mix(in srgb, var(--color-text-black) 68%, transparent);
}

.Dashboard-RecordCard__Bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.Dashboard-Empty {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed
    color-mix(in srgb, var(--color-text-black) 12%, transparent);
  border-radius: 18px;
  padding: 16px;
  text-align: center;
  margin-top: 14px;
}

.Dashboard-Empty.is-compact {
  min-height: 280px;
  margin-top: 14px;
}

.Dashboard-Empty__IconWrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background-color: color-mix(in srgb, var(--color-background) 70%, white);
}

.Dashboard-Empty__Icon {
  width: 28px;
  height: 28px;
}

.Dashboard-Empty__Title {
  font-size: 0.9rem;
  font-weight: 700;
}

.Dashboard-Empty__Text {
  max-width: 360px;
  font-size: 0.76rem;
  color: color-mix(in srgb, var(--color-text-black) 65%, transparent);
}

.Dashboard-Modal {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 30;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.Dashboard-Modal__Card {
  width: min(720px, calc(100vw - 72px));
  max-height: calc(100vh - 180px);
  overflow: auto;
  padding: 16px;
  background-color: var(--color-card);
  pointer-events: auto;
  box-shadow: 0px 18px 48px rgba(0, 0, 0, 0.16);
}

.Dashboard-Modal.is-goal {
  top: 42px;
}

.Dashboard-Modal__Card--goal {
  width: min(440px, calc(100vw - 72px));
}

.Dashboard-Modal__Header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.Dashboard-Modal__Subtitle {
  margin-top: 4px;
}

.Dashboard-Modal__Close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background-color: color-mix(in srgb, var(--color-background) 72%, white);
}

.Dashboard-Modal__Close :deep(svg) {
  width: 18px;
  height: 18px;
}

.Dashboard-Select {
  position: relative;
}

.Dashboard-Select__Trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.Dashboard-Select__Value,
.Dashboard-Select__Option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.Dashboard-Select__Value strong,
.Dashboard-Select__Option strong {
  display: block;
  font-size: 0.8rem;
}

.Dashboard-Select__Value small,
.Dashboard-Select__Option small {
  display: block;
  margin-top: 2px;
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--color-text-black) 62%, transparent);
}

.Dashboard-Select__Icon,
.Dashboard-Select__Chevron {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.Dashboard-Select__Placeholder {
  color: color-mix(in srgb, var(--color-text-black) 56%, transparent);
  font-size: 0.82rem;
}

.Dashboard-Select__Menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 4;
  display: grid;
  gap: 4px;
  padding: 6px;
  border-radius: 14px;
  background-color: var(--color-card);
  box-shadow: 0px 10px 28px rgba(0, 0, 0, 0.12);
}

.Dashboard-Select__Option {
  width: 100%;
  border-radius: 10px;
  padding: 8px 10px;
  text-align: left;
}

.Dashboard-Select__Option:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-background) 72%, white);
}

.Dashboard-Segment {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  border-radius: 14px;
  padding: 6px;
}

.Dashboard-Segment__Item {
  min-height: 34px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: color-mix(in srgb, var(--color-text-black) 72%, transparent);
}

.Dashboard-Segment__Item.is-active {
  background-color: white;
  color: var(--color-text-black);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.08);
}

.Dashboard-Options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.Dashboard-Option {
  display: flex;
  min-height: 74px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  border-radius: 14px;
  padding: 10px 12px;
  text-align: left;
}

.Dashboard-Option strong {
  font-size: 0.8rem;
}

.Dashboard-Option small {
  font-size: 0.72rem;
  line-height: 1.4;
  color: color-mix(in srgb, var(--color-text-black) 62%, transparent);
}

.Dashboard-Option.is-active {
  border-color: color-mix(in srgb, #5cabff 40%, transparent);
  background-color: color-mix(in srgb, #5cabff 10%, white);
}

.Dashboard-Preview {
  border: 1px solid color-mix(in srgb, #5cabff 18%, transparent);
  background:
    linear-gradient(
      180deg,
      rgba(159, 212, 255, 0.16),
      rgba(255, 255, 255, 0.72)
    ),
    white;
}

.Dashboard-Modal-enter-active,
.Dashboard-Modal-leave-active {
  transition: opacity 0.2s ease;
}

.Dashboard-Modal-enter-active .Dashboard-Modal__Card,
.Dashboard-Modal-leave-active .Dashboard-Modal__Card {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.Dashboard-Modal-enter-from,
.Dashboard-Modal-leave-to {
  opacity: 0;
}

.Dashboard-Modal-enter-from .Dashboard-Modal__Card,
.Dashboard-Modal-leave-to .Dashboard-Modal__Card {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 960px) {
  .Dashboard-Main {
    grid-template-columns: minmax(140px, 40%) minmax(0, 60%);
    gap: 12px;
  }

  .Dashboard-BodyPanel,
  .Dashboard-RecordsPanel {
    padding: 10px;
  }

  .Dashboard-BodyMeter {
    width: min(150px, 100%);
    min-width: 120px;
  }

  .Dashboard-BodyMeter__Badge {
    bottom: 2px;
    padding: 6px 10px;
    font-size: 0.68rem;
  }

  .Dashboard-Metric {
    min-height: 36px;
    padding: 5px 7px;
  }

  .Dashboard-Metric__Value {
    font-size: 0.72rem;
  }

  .Dashboard-GoalForm__Row {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .Dashboard-Page {
    padding: 4px;
  }

  .Dashboard-Header {
    padding-bottom: 6px;
  }

  .Dashboard-Header__Title {
    font-size: 0.92rem;
  }

  .Dashboard-Main {
    grid-template-columns: minmax(132px, 38%) minmax(0, 62%);
    gap: 10px;
  }

  .Dashboard-BodyPanel,
  .Dashboard-RecordsPanel {
    padding: 10px;
  }

  .Dashboard-AddButton {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }

  .Dashboard-BodyMeter {
    width: min(124px, 100%);
    min-width: 100px;
  }

  .Dashboard-BodyPanel__Stats {
    gap: 6px;
    margin-top: 6px;
  }

  .Dashboard-Metric {
    min-height: 34px;
    gap: 5px;
    padding: 5px 6px;
    border-radius: 12px;
  }

  .Dashboard-Metric__Icon {
    width: 13px;
    height: 13px;
  }

  .Dashboard-Metric__Value {
    font-size: 0.68rem;
  }

  .Dashboard-Metric__Action {
    min-width: 34px;
    min-height: 22px;
    padding: 0 7px;
    font-size: 0.62rem;
  }

  .Dashboard-BodyPanel__Progress {
    margin-top: 6px;
  }

  .Dashboard-BodyPanel__ProgressMeta {
    align-items: flex-start;
    gap: 4px;
    flex-direction: column;
    margin-bottom: 6px;
    font-size: 0.68rem;
  }

  .Dashboard-ProgressTrack {
    height: 10px;
  }

  .Dashboard-GoalForm {
    margin-top: 8px;
  }

  .Dashboard-GoalForm__Row,
  .Dashboard-Form,
  .Dashboard-Options {
    grid-template-columns: 1fr;
  }

  .Dashboard-Chip {
    min-height: 24px;
    padding: 0 8px;
    font-size: 0.64rem;
  }

  .Dashboard-RecordsPanel__Header {
    gap: 8px;
  }

  .Dashboard-SectionTitle {
    font-size: 0.84rem;
  }

  .Dashboard-SectionText,
  .Dashboard-RecordCard__Time,
  .Dashboard-RecordCard__Bottom {
    font-size: 0.68rem;
  }

  .Dashboard-Records {
    gap: 10px;
    margin-top: 12px;
  }

  .Dashboard-RecordCard {
    padding: 12px;
    border-radius: 14px;
  }

  .Dashboard-RecordCard__Title {
    font-size: 0.82rem;
  }

  .Dashboard-RecordCard__Amount {
    font-size: 0.76rem;
  }

  .Dashboard-RecordCard__Bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .Dashboard-Modal__Card {
    width: min(100%, calc(100vw - 32px));
    padding: 16px;
  }
}
</style>
