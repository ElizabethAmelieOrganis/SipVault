<template>
  <view class="page-shell">
    <view class="page-header">
      <text class="page-title">记录饮水</text>
      <text class="page-subtitle">
        选择一个水源后，SipVault 会自动计算并扣减它的剩余水量。
      </text>
    </view>

    <view v-if="accounts.length === 0" class="surface-card">
      <view class="empty-card">
        <text class="empty-title">还没有可记录的水源</text>
        <text class="empty-copy">先去水源页创建容器，再回来记录今天的饮水。</text>
        <view class="button-row accounts-empty__actions">
          <button class="primary-btn" @click="openAccountsPage">去添加水源</button>
        </view>
      </view>
    </view>

    <view v-else class="surface-card">
      <view class="field-block">
        <text class="field-label">记录时间</text>
        <view class="field-picker">{{ currentTimeLabel }}</view>
      </view>

      <view class="field-block">
        <text class="field-label">水源</text>
        <picker
          :range="accountPickerLabels"
          :value="selectedAccountIndex"
          @change="handleAccountChange"
        >
          <view class="field-picker">{{ selectedAccountLabel }}</view>
        </picker>
        <text v-if="selectedAccount" class="field-hint">
          当前剩余 {{ formatVolume(selectedAccount.remainingWaterMl) }}
        </text>
      </view>

      <view class="field-block">
        <text class="field-label">记录方式</text>
        <view class="segmented">
          <button
            :class="['segmented__item', { 'is-active': mode === 'exact' }]"
            @click="mode = 'exact'"
          >
            精确输入
          </button>
          <button
            :class="['segmented__item', { 'is-active': mode === 'estimated' }]"
            @click="mode = 'estimated'"
          >
            快速估算
          </button>
        </view>
      </view>

      <template v-if="mode === 'exact'">
        <view class="field-block">
          <text class="field-label">饮水量</text>
          <input
            v-model="exactAmountInput"
            class="field-input"
            type="digit"
            placeholder="例如 250"
          />
        </view>

        <view class="field-block">
          <text class="field-label">单位</text>
          <picker
            :range="unitLabels"
            :value="unitIndex"
            @change="handleUnitChange"
          >
            <view class="field-picker">{{ unitLabels[unitIndex] }}</view>
          </picker>
        </view>
      </template>

      <view v-else class="field-block">
        <text class="field-label">估算方式</text>
        <view class="record-options">
          <button
            v-for="option in estimatedOptions"
            :key="option.value"
            :class="[
              'record-option',
              { 'record-option--active': estimatedOption === option.value },
            ]"
            @click="estimatedOption = option.value"
          >
            <text class="record-option__title">{{ option.label }}</text>
            <text class="record-option__desc">{{ option.description }}</text>
          </button>
        </view>
      </view>

      <view class="field-block">
        <text class="field-label">本次预览</text>
        <view class="summary-card record-preview">
          <text class="summary-label">将记录</text>
          <text class="summary-value">
            {{ previewConsumedMl > 0 ? formatVolume(previewConsumedMl) : "0 mL" }}
          </text>
          <text class="summary-note">
            {{
              selectedAccount
                ? isPreviewClamped
                  ? `超过当前剩余水量，保存时会被限制到 ${formatVolume(selectedAccount.remainingWaterMl)}。`
                  : `保存后该水源还会剩余 ${formatVolume(previewRemainingMl)}。`
                : "请选择一个水源查看预览。"
            }}
          </text>
        </view>
      </view>

      <text v-if="errorMessage" class="form-error">{{ errorMessage }}</text>

      <view class="button-row record-actions">
        <button class="ghost-btn" @click="goBack">取消</button>
        <button class="primary-btn" @click="saveRecord">保存记录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
  estimatedOptions,
  type EstimatedOptionValue,
  unitOptions,
} from "@/constants/water";
import { listWaterAccounts, recordWaterIntake } from "@/services/water";
import type {
  WaterAccountRecord,
  WaterIntakeMode,
} from "@/types/water";
import {
  convertToMl,
  createRecordId,
  formatDateKey,
  formatVolume,
  getEstimatedConsumedMl,
  getEstimatedNote,
  normalizeInteger,
} from "@/utils/water";

const now = ref(Date.now());
const accounts = ref<WaterAccountRecord[]>([]);
const pendingAccountId = ref("");
const selectedAccountId = ref("");
const mode = ref<WaterIntakeMode>("exact");
const exactAmountInput = ref("250");
const unitIndex = ref(0);
const estimatedOption = ref<EstimatedOptionValue>("sip");
const errorMessage = ref("");

const unitLabels = unitOptions.map((item) => item.label);
const currentTimeLabel = computed(() => {
  const date = new Date(now.value);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
});
const todayKey = computed(() => formatDateKey(now.value));
const accountPickerLabels = computed(() =>
  accounts.value.map(
    (account) => `${account.brand} · ${formatVolume(account.remainingWaterMl)} 剩余`,
  ),
);
const selectedAccountIndex = computed(() => {
  const index = accounts.value.findIndex((account) => account.id === selectedAccountId.value);
  return index >= 0 ? index : 0;
});
const selectedAccount = computed(
  () => accounts.value.find((account) => account.id === selectedAccountId.value) ?? null,
);
const selectedAccountLabel = computed(() => {
  if (!selectedAccount.value) {
    return "请选择一个水源";
  }

  return `${selectedAccount.value.brand} · ${formatVolume(selectedAccount.value.remainingWaterMl)} 剩余`;
});
const requestedConsumedMl = computed(() => {
  if (!selectedAccount.value) {
    return 0;
  }

  if (mode.value === "exact") {
    return convertToMl(
      Number(exactAmountInput.value),
      unitOptions[unitIndex.value]?.value ?? "ml",
    );
  }

  return getEstimatedConsumedMl(selectedAccount.value, estimatedOption.value);
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

  return Math.max(selectedAccount.value.remainingWaterMl - previewConsumedMl.value, 0);
});
const isPreviewClamped = computed(() => {
  if (!selectedAccount.value) {
    return false;
  }

  return normalizeInteger(requestedConsumedMl.value) > selectedAccount.value.remainingWaterMl;
});

function chooseDefaultAccount() {
  const accountIdFromQuery = pendingAccountId.value;

  if (
    accountIdFromQuery &&
    accounts.value.some((account) => account.id === accountIdFromQuery)
  ) {
    selectedAccountId.value = accountIdFromQuery;
    return;
  }

  selectedAccountId.value =
    accounts.value.find((account) => account.remainingWaterMl > 0)?.id ??
    accounts.value[0]?.id ??
    "";
}

function loadAccounts() {
  now.value = Date.now();
  accounts.value = listWaterAccounts();
  chooseDefaultAccount();
  errorMessage.value = "";
}

function handleAccountChange(event: { detail: { value: string } }) {
  const nextIndex = Number(event.detail.value);
  selectedAccountId.value = accounts.value[nextIndex]?.id ?? "";
}

function handleUnitChange(event: { detail: { value: string } }) {
  unitIndex.value = Number(event.detail.value);
}

function saveRecord() {
  if (!selectedAccount.value) {
    errorMessage.value = "请先选择一个水源。";
    return;
  }

  if (previewConsumedMl.value <= 0) {
    errorMessage.value = "请输入有效的饮水量。";
    return;
  }

  recordWaterIntake({
    id: createRecordId(),
    recordDate: todayKey.value,
    accountId: selectedAccount.value.id,
    requestedConsumedMl: requestedConsumedMl.value,
    mode: mode.value,
    note: mode.value === "estimated" ? getEstimatedNote(estimatedOption.value) : null,
  });

  uni.showToast({
    title: "记录已保存",
    icon: "success",
  });

  setTimeout(() => {
    uni.navigateBack();
  }, 220);
}

function openAccountsPage() {
  uni.switchTab({
    url: "/pages/accounts/index",
  });
}

function goBack() {
  uni.navigateBack();
}

onLoad((options) => {
  pendingAccountId.value =
    typeof options?.accountId === "string" ? options.accountId : "";
});

onShow(() => {
  loadAccounts();
});
</script>

<style scoped>
.accounts-empty__actions {
  justify-content: center;
  margin-top: 18rpx;
}

.record-options {
  margin-top: -8rpx;
}

.record-option {
  display: block;
  width: 100%;
  margin-top: 16rpx;
  padding: 22rpx;
  border: 1px solid rgba(16, 83, 148, 0.1);
  border-radius: 28rpx;
  background: rgba(248, 251, 255, 0.96);
  text-align: left;
}

.record-option--active {
  border-color: rgba(15, 110, 253, 0.32);
  background: rgba(15, 110, 253, 0.08);
}

.record-option__title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: #10253d;
}

.record-option__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #6b8096;
}

.record-preview {
  width: 100%;
}

.record-actions {
  margin-top: 24rpx;
}
</style>
