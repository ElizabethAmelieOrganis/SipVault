<template>
  <section class="Accounts-Page">
    <header class="Accounts-Header">
      <div>
        <h1 class="Accounts-Title">Add the drinking water you have enabled here</h1>
        <p class="Accounts-Subtitle">
          Track each container and keep its remaining water updated.
        </p>
      </div>
      <button class="Accounts-AddButton" type="button" @click="openCreateModal">
        <Plus class="Accounts-AddButton__Icon" />
      </button>
    </header>

    <div class="Accounts-Content">
      <p v-if="pageError" class="Accounts-PageError">{{ pageError }}</p>

      <div v-if="accounts.length === 0" class="Accounts-Empty">
        <div class="Accounts-Empty__IconWrap">
          <GlassWater class="Accounts-Empty__Icon" />
        </div>
        <p class="Accounts-Empty__Title">No drinking water added yet</p>
        <p class="Accounts-Empty__Text">
          Use the plus button to add your first enabled container.
        </p>
      </div>

      <div v-else class="Accounts-List">
        <article
          v-for="account in accounts"
          :key="account.id"
          class="Accounts-Card"
          :style="{ '--account-status-color': getAccountStatusColor(account) }"
        >
          <div class="Accounts-Card__Layout">
            <div class="Accounts-Card__Body">
              <div class="Accounts-Card__Top">
                <div class="Accounts-Card__Leading">
                  <span class="Accounts-Card__StatusDot"></span>
                  <component
                    :is="getContainerOption(account.container).icon"
                    class="Accounts-Card__Icon"
                  />
                  <div>
                    <h2 class="Accounts-Card__Id">{{ account.id }}</h2>
                    <p class="Accounts-Card__Brand">{{ account.brand }}</p>
                  </div>
                </div>
                <div class="Accounts-Card__Meta">
                  <p class="Accounts-Card__Container">
                    {{ getContainerOption(account.container).label }}
                  </p>
                  <p class="Accounts-Card__StatusText">
                    {{ getHoursSinceCreated(account) }} h elapsed
                  </p>
                  <div class="Accounts-Card__Actions">
                    <button
                      class="Accounts-Card__ActionButton"
                      type="button"
                      aria-label="Edit record"
                      @click="openEditModal(account)"
                    >
                      <Pencil />
                    </button>
                    <button
                      class="Accounts-Card__ActionButton is-danger"
                      type="button"
                      aria-label="Delete record"
                      @click="removeAccount(account)"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </div>

              <div class="Accounts-Card__Grid">
                <div class="Accounts-Card__Item">
                  <span class="Accounts-Card__Label">Initial</span>
                  <span class="Accounts-Card__Value">{{ account.initialWaterMl }} ml</span>
                </div>
                <div class="Accounts-Card__Item">
                  <span class="Accounts-Card__Label">Remaining</span>
                  <span class="Accounts-Card__Value">{{ account.remainingWaterMl }} ml</span>
                </div>
                <div class="Accounts-Card__Item">
                  <span class="Accounts-Card__Label">Location</span>
                  <span class="Accounts-Card__Value">{{ account.location }}</span>
                </div>
                <div class="Accounts-Card__Item">
                  <span class="Accounts-Card__Label">Start Time</span>
                  <span class="Accounts-Card__Value">{{ account.startTimeHours }} h</span>
                </div>
                <div class="Accounts-Card__Item">
                  <span class="Accounts-Card__Label">Recorded</span>
                  <span class="Accounts-Card__Value">{{ formatRecordedAt(account.createdAt) }}</span>
                </div>
                <div class="Accounts-Card__Item">
                  <span class="Accounts-Card__Label">Status</span>
                  <span
                    class="Accounts-Card__Value Accounts-Card__Value--status"
                    :style="{ color: getAccountStatusColor(account) }"
                  >
                    {{ getAccountStatusLabel(account) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="Accounts-Card__WaterMeter">
              <div class="Accounts-Card__WaterTrack">
                <div
                  class="Accounts-Card__WaterFill"
                  :style="{ height: `${getRemainingWaterPercent(account)}%` }"
                ></div>
              </div>
              <span class="Accounts-Card__WaterText">{{ account.remainingWaterMl }} ml</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <Transition name="Accounts-Modal">
      <div v-if="isModalOpen" class="Accounts-Modal">
        <div class="Accounts-Modal__Card">
          <div class="Accounts-Modal__Header">
            <div>
              <h2 class="Accounts-Modal__Title">{{ modalTitle }}</h2>
              <p class="Accounts-Modal__Subtitle">
                {{ modalSubtitle }}
              </p>
            </div>
            <button class="Accounts-Modal__Close" type="button" @click="closeModal">
              <X />
            </button>
          </div>

          <form class="Accounts-Form" @submit.prevent="submitForm">
            <label class="Accounts-Field">
              <span class="Accounts-Field__Label">ID</span>
              <input
                v-model="form.id"
                class="Accounts-Field__Input is-readonly"
                type="text"
                readonly
              />
            </label>

            <div class="Accounts-Field">
              <span class="Accounts-Field__Label">Container</span>
              <div class="Accounts-Select">
                <button
                  class="Accounts-Select__Trigger"
                  type="button"
                  @click="toggleContainerMenu"
                >
                  <span class="Accounts-Select__Value">
                    <component
                      :is="selectedContainerOption.icon"
                      class="Accounts-Select__Icon"
                    />
                    <span>{{ selectedContainerOption.label }}</span>
                  </span>
                  <ChevronDown class="Accounts-Select__Chevron" />
                </button>

                <div v-if="isContainerMenuOpen" class="Accounts-Select__Menu">
                  <button
                    v-for="option in containerOptions"
                    :key="option.value"
                    class="Accounts-Select__Option"
                    type="button"
                    @click="selectContainer(option.value)"
                  >
                    <component :is="option.icon" class="Accounts-Select__Icon" />
                    <span>{{ option.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <label class="Accounts-Field">
              <span class="Accounts-Field__Label">Brand</span>
              <input
                v-model.trim="form.brand"
                class="Accounts-Field__Input"
                type="text"
                placeholder="Brand name"
                required
              />
            </label>

            <label class="Accounts-Field">
              <span class="Accounts-Field__Label">Initial Water (ml)</span>
              <input
                v-model.number="form.initialWaterMl"
                class="Accounts-Field__Input"
                type="number"
                min="0"
                step="1"
                placeholder="500"
                required
              />
            </label>

            <label class="Accounts-Field">
              <span class="Accounts-Field__Label">Remaining Water (ml)</span>
              <input
                v-model.number="form.remainingWaterMl"
                class="Accounts-Field__Input"
                type="number"
                min="0"
                step="1"
                placeholder="500"
                required
              />
            </label>

            <label class="Accounts-Field">
              <span class="Accounts-Field__Label">Location</span>
              <input
                v-model.trim="form.location"
                class="Accounts-Field__Input"
                type="text"
                placeholder="Desk, kitchen, bedside..."
                required
              />
            </label>

            <label class="Accounts-Field">
              <span class="Accounts-Field__Label">Start Time (hours)</span>
              <input
                v-model.number="form.startTimeHours"
                class="Accounts-Field__Input"
                type="number"
                min="0"
                step="1"
                placeholder="0"
              />
            </label>

            <p v-if="formError" class="Accounts-Form__Error">{{ formError }}</p>

            <div class="Accounts-Form__Actions">
              <button class="Accounts-Form__Button is-secondary" type="button" @click="closeModal">
                Cancel
              </button>
              <button class="Accounts-Form__Button is-primary" type="submit" :disabled="isSaving">
                {{ isSaving ? "Saving..." : modalSubmitText }}
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
  GlassWater,
  Package,
  Pencil,
  Plus,
  Soup,
  Trash2,
  X,
} from "@lucide/vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import {
  canUseDatabase,
  createWaterAccount,
  deleteWaterAccount,
  listWaterAccounts,
  updateWaterAccount,
  type WaterAccountContainer as ContainerType,
  type WaterAccountRecord as WaterAccount,
} from "../../database";

interface WaterAccountForm {
  id: string;
  container: ContainerType;
  brand: string;
  initialWaterMl: number;
  remainingWaterMl: number;
  location: string;
  startTimeHours: number;
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

const accounts = ref<WaterAccount[]>([]);
const isModalOpen = ref(false);
const isContainerMenuOpen = ref(false);
const formError = ref("");
const pageError = ref("");
const isSaving = ref(false);
const now = ref(Date.now());
const editingAccountId = ref<string | null>(null);

const form = reactive<WaterAccountForm>(createDefaultForm());

let nowTimer: ReturnType<typeof setInterval> | null = null;

const selectedContainerOption = computed(() =>
  getContainerOption(form.container),
);
const isEditing = computed(() => editingAccountId.value !== null);
const modalTitle = computed(() =>
  isEditing.value ? "Edit Water Container" : "Add Water Container",
);
const modalSubtitle = computed(() =>
  isEditing.value
    ? "Update the details below to keep this record accurate."
    : "Fill in the details below to create a new entry.",
);
const modalSubmitText = computed(() =>
  isEditing.value ? "Update" : "Save",
);

function createAccountId() {
  return `WTR-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function createDefaultForm(): WaterAccountForm {
  return {
    id: createAccountId(),
    container: "plastic-bottle",
    brand: "",
    initialWaterMl: 500,
    remainingWaterMl: 500,
    location: "",
    startTimeHours: 0,
  };
}

function resetForm() {
  Object.assign(form, createDefaultForm());
  formError.value = "";
  isContainerMenuOpen.value = false;
  editingAccountId.value = null;
}

function openCreateModal() {
  resetForm();
  isModalOpen.value = true;
}

function openEditModal(account: WaterAccount) {
  form.id = account.id;
  form.container = account.container;
  form.brand = account.brand;
  form.initialWaterMl = account.initialWaterMl;
  form.remainingWaterMl = account.remainingWaterMl;
  form.location = account.location;
  form.startTimeHours = account.startTimeHours;
  formError.value = "";
  isContainerMenuOpen.value = false;
  editingAccountId.value = account.id;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  isContainerMenuOpen.value = false;
  formError.value = "";
  editingAccountId.value = null;
}

function toggleContainerMenu() {
  isContainerMenuOpen.value = !isContainerMenuOpen.value;
}

function selectContainer(value: ContainerType) {
  form.container = value;
  isContainerMenuOpen.value = false;
}

function getContainerOption(value: ContainerType) {
  return (
    containerOptions.find((option) => option.value === value) ?? containerOptions[0]
  );
}

function normalizeInteger(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.round(value), 0);
}

async function submitForm() {
  if (
    !form.brand ||
    !form.location
  ) {
    formError.value = "Please complete all required fields.";
    return;
  }

  form.initialWaterMl = normalizeInteger(form.initialWaterMl);
  form.remainingWaterMl = normalizeInteger(form.remainingWaterMl);
  form.startTimeHours = normalizeInteger(form.startTimeHours);

  if (form.remainingWaterMl > form.initialWaterMl) {
    formError.value = "Remaining water cannot exceed the initial water amount.";
    return;
  }

  const nextAccount: WaterAccount = {
    id: form.id,
    container: form.container,
    brand: form.brand,
    initialWaterMl: form.initialWaterMl,
    remainingWaterMl: form.remainingWaterMl,
    location: form.location,
    startTimeHours: form.startTimeHours,
    createdAt: new Date().toISOString(),
  };

  isSaving.value = true;

  try {
    if (canUseDatabase()) {
      if (isEditing.value) {
        await updateWaterAccount(nextAccount.id, {
          container: nextAccount.container,
          brand: nextAccount.brand,
          initialWaterMl: nextAccount.initialWaterMl,
          remainingWaterMl: nextAccount.remainingWaterMl,
          location: nextAccount.location,
          startTimeHours: nextAccount.startTimeHours,
        });
      } else {
        await createWaterAccount(nextAccount);
      }
    }

    if (isEditing.value) {
      accounts.value = accounts.value.map((account) =>
        account.id === nextAccount.id
          ? {
              ...account,
              ...nextAccount,
              createdAt: account.createdAt,
            }
          : account,
      );
    } else {
      accounts.value.unshift(nextAccount);
    }

    closeModal();
  } catch (error) {
    console.error("Failed to save water account", error);
    formError.value = "Failed to save this record. Please try again.";
  } finally {
    isSaving.value = false;
  }
}

async function removeAccount(account: WaterAccount) {
  const shouldDelete = window.confirm(
    `Delete ${account.id}? This action cannot be undone.`,
  );

  if (!shouldDelete) {
    return;
  }

  try {
    if (canUseDatabase()) {
      await deleteWaterAccount(account.id);
    }

    accounts.value = accounts.value.filter((item) => item.id !== account.id);
    pageError.value = "";
  } catch (error) {
    console.error("Failed to delete water account", error);
    pageError.value = "Failed to delete this water record.";
  }
}

async function loadAccounts() {
  if (!canUseDatabase()) {
    return;
  }

  try {
    accounts.value = await listWaterAccounts();
    pageError.value = "";
  } catch (error) {
    console.error("Failed to load water accounts", error);
    pageError.value = "Failed to load saved water records.";
  }
}

function getHoursSinceCreated(account: WaterAccount) {
  const createdAtTime = new Date(account.createdAt).getTime();
  const diffHours = Math.floor((now.value - createdAtTime) / (1000 * 60 * 60));
  return Math.max(diffHours + account.startTimeHours, 0);
}

function getAccountStatusColor(account: WaterAccount) {
  const hours = getHoursSinceCreated(account);

  if (hours <= 12) {
    return "var(--color-status-active)";
  }

  if (hours <= 24) {
    return "var(--color-status-pending)";
  }

  return "var(--color-status-inactive)";
}

function getAccountStatusLabel(account: WaterAccount) {
  const hours = getHoursSinceCreated(account);

  if (hours <= 12) {
    return "Safe to drink";
  }

  if (hours <= 24) {
    return "Not recommended to drink";
  }

  return "Do not drink";
}

function getRemainingWaterPercent(account: WaterAccount) {
  if (account.initialWaterMl <= 0) {
    return 0;
  }

  const percent = (account.remainingWaterMl / account.initialWaterMl) * 100;
  return Math.min(Math.max(percent, 0), 100);
}

function formatRecordedAt(value: string) {
  const date = new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${month}/${day} ${hours}:${minutes}`;
}

onMounted(() => {
  nowTimer = setInterval(() => {
    now.value = Date.now();
  }, 60000);

  void loadAccounts();
});

onBeforeUnmount(() => {
  if (nowTimer !== null) {
    clearInterval(nowTimer);
  }
});
</script>

<style scoped>
.Accounts-Page {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  color: var(--color-text-black);
  font-family: "JetBrains Mono";
  padding: 10px;
}

.Accounts-Header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 4px 4px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--color-text-black) 8%, transparent);
}

.Accounts-Title {
  font-size: 1.08rem;
  line-height: 1.3;
}

.Accounts-Subtitle {
  margin-top: 6px;
  color: color-mix(in srgb, var(--color-text-black) 65%, transparent);
  font-size: 0.8rem;
}

.Accounts-AddButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background-color: var(--color-text-black);
  color: white;
  flex-shrink: 0;
}

.Accounts-Content {
  flex: 1 0 auto;
  width: 100%;
  min-width: 0;
  margin-top: 16px;
  padding-right: 4px;
}

.Accounts-AddButton__Icon {
  width: 20px;
  height: 20px;
}

.Accounts-PageError {
  margin-bottom: 12px;
  border-radius: 12px;
  background-color: color-mix(in srgb, #cb3a31 10%, white);
  padding: 10px 12px;
  color: #cb3a31;
  font-size: 0.78rem;
  font-weight: 700;
}

.Accounts-Empty,
.Accounts-Card,
.Accounts-Modal__Card {
  background-color: color-mix(in srgb, var(--color-card) 92%, var(--color-background));
  border-radius: 18px;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.06);
  border: 1px solid color-mix(in srgb, var(--color-text-black) 6%, transparent);
}

.Accounts-Empty {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  padding: 24px;
  border-style: dashed;
}

.Accounts-Empty__IconWrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background-color: color-mix(in srgb, var(--color-background) 70%, white);
}

.Accounts-Empty__Icon {
  width: 28px;
  height: 28px;
}

.Accounts-Empty__Title {
  font-size: 0.98rem;
  font-weight: 700;
}

.Accounts-Empty__Text {
  max-width: 360px;
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--color-text-black) 65%, transparent);
}

.Accounts-List {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.Accounts-Card {
  padding: 14px;
}

.Accounts-Card__Layout {
  display: flex;
  align-items: stretch;
  gap: 14px;
}

.Accounts-Card__Body {
  min-width: 0;
  flex: 1;
}

.Accounts-Card__Top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.Accounts-Card__Leading {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.Accounts-Card__StatusDot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--account-status-color);
  box-shadow: 0 0 0 4px
    color-mix(in srgb, var(--account-status-color) 16%, transparent);
}

.Accounts-Card__Icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.Accounts-Card__Id {
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.03em;
}

.Accounts-Card__Brand,
.Accounts-Card__Meta,
.Accounts-Card__Container,
.Accounts-Card__Label,
.Accounts-Form__Error,
.Accounts-Modal__Subtitle {
  color: color-mix(in srgb, var(--color-text-black) 65%, transparent);
  font-size: 0.8rem;
}

.Accounts-Card__Brand {
  margin-top: 2px;
  font-size: 0.72rem;
}

.Accounts-Card__Meta {
  flex-shrink: 0;
  text-align: right;
}

.Accounts-Card__Container,
.Accounts-Card__StatusText {
  font-size: 0.72rem;
}

.Accounts-Card__StatusText {
  margin-top: 2px;
  color: var(--account-status-color);
  font-weight: 700;
}

.Accounts-Card__Actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}

.Accounts-Card__ActionButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background-color: color-mix(in srgb, var(--color-background) 70%, white);
  color: var(--color-text-black);
}

.Accounts-Card__ActionButton.is-danger {
  color: #cb3a31;
}

.Accounts-Card__ActionButton :deep(svg) {
  width: 14px;
  height: 14px;
}

.Accounts-Card__Grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  margin-top: 12px;
}

.Accounts-Card__Item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.Accounts-Card__Value {
  font-size: 0.82rem;
  font-weight: 700;
}

.Accounts-Card__Value--status {
  letter-spacing: 0.02em;
}

.Accounts-Card__WaterMeter {
  display: flex;
  min-width: 34px;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.Accounts-Card__WaterTrack {
  position: relative;
  display: flex;
  width: 12px;
  flex: 1;
  min-height: 136px;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 999px;
  background-color: rgba(130, 190, 255, 0.18);
}

.Accounts-Card__WaterFill {
  width: 100%;
  border-radius: inherit;
  background: linear-gradient(180deg, #9fd4ff 0%, #7ec3ff 100%);
  transition: height 0.2s ease;
}

.Accounts-Card__WaterText {
  font-size: 0.68rem;
  font-weight: 700;
  color: color-mix(in srgb, var(--color-text-black) 68%, transparent);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.Accounts-Modal {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.Accounts-Modal__Card {
  position: relative;
  width: min(720px, calc(100vw - 72px));
  max-height: calc(100vh - 180px);
  overflow: auto;
  padding: 16px;
  background-color: var(--color-card);
  pointer-events: auto;
  box-shadow: 0px 18px 48px rgba(0, 0, 0, 0.16);
}

.Accounts-Modal__Header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.Accounts-Modal__Title {
  font-size: 1rem;
}

.Accounts-Modal__Subtitle {
  margin-top: 4px;
}

.Accounts-Modal__Close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background-color: color-mix(in srgb, var(--color-background) 72%, white);
}

.Accounts-Modal__Close :deep(svg) {
  width: 18px;
  height: 18px;
}

.Accounts-Form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  margin-top: 14px;
}

.Accounts-Field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.Accounts-Field__Label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.Accounts-Field__Input,
.Accounts-Select__Trigger {
  width: 100%;
  min-height: 38px;
  border: 1px solid color-mix(in srgb, var(--color-text-black) 10%, transparent);
  border-radius: 12px;
  background-color: color-mix(in srgb, var(--color-background) 55%, white);
  padding: 0 12px;
  color: var(--color-text-black);
}

.Accounts-Field__Input:focus,
.Accounts-Select__Trigger:focus {
  outline: 2px solid color-mix(in srgb, var(--color-text-black) 18%, transparent);
  outline-offset: 1px;
}

.Accounts-Field__Input.is-readonly {
  color: color-mix(in srgb, var(--color-text-black) 68%, transparent);
}

.Accounts-Select {
  position: relative;
}

.Accounts-Select__Trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.Accounts-Select__Value,
.Accounts-Select__Option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.Accounts-Select__Icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.Accounts-Select__Chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.Accounts-Select__Menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 4;
  display: grid;
  gap: 4px;
  padding: 6px;
  background-color: var(--color-card);
  border-radius: 14px;
  box-shadow: 0px 10px 28px rgba(0, 0, 0, 0.12);
}

.Accounts-Select__Option {
  width: 100%;
  border-radius: 10px;
  padding: 8px 10px;
}

.Accounts-Select__Option:hover {
  background-color: color-mix(in srgb, var(--color-background) 72%, white);
}

.Accounts-Form__Error {
  grid-column: 1 / -1;
  color: #cb3a31;
}

.Accounts-Form__Actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}

.Accounts-Form__Button {
  min-width: 84px;
  min-height: 36px;
  border-radius: 12px;
  padding: 0 14px;
  font-weight: 700;
}

.Accounts-Form__Button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.Accounts-Form__Button.is-secondary {
  background-color: color-mix(in srgb, var(--color-background) 72%, white);
}

.Accounts-Form__Button.is-primary {
  background-color: var(--color-text-black);
  color: white;
}

.Accounts-Modal-enter-active,
.Accounts-Modal-leave-active {
  transition: opacity 0.2s ease;
}

.Accounts-Modal-enter-active .Accounts-Modal__Card,
.Accounts-Modal-leave-active .Accounts-Modal__Card {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.Accounts-Modal-enter-from,
.Accounts-Modal-leave-to {
  opacity: 0;
}

.Accounts-Modal-enter-from .Accounts-Modal__Card,
.Accounts-Modal-leave-to .Accounts-Modal__Card {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 640px) {
  .Accounts-Page {
    padding: 4px;
  }

  .Accounts-Header {
    align-items: center;
    padding-bottom: 12px;
  }

  .Accounts-Title {
    font-size: 1rem;
  }

  .Accounts-List,
  .Accounts-Form {
    grid-template-columns: 1fr;
  }

  .Accounts-Card__WaterTrack {
    min-height: 120px;
  }

  .Accounts-Modal__Card {
    width: min(100%, calc(100vw - 32px));
    padding: 16px;
  }
}
</style>
