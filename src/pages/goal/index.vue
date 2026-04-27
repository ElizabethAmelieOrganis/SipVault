<template>
  <view class="page-shell">
    <view class="page-header">
      <text class="page-title">调整今日目标</text>
      <text class="page-subtitle">
        当前日期是 {{ todayLabel }}。目标会保存到本地，重新打开 App 也会保留。
      </text>
    </view>

    <view class="surface-card">
      <view class="field-block">
        <text class="field-label">目标数值</text>
        <input
          v-model="amountInput"
          class="field-input"
          type="digit"
          placeholder="例如 2 或 2000"
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

      <view class="field-block">
        <text class="field-label">快捷预设</text>
        <view class="chips">
          <button
            v-for="preset in goalPresets"
            :key="preset"
            class="pill-btn"
            @click="applyPreset(preset)"
          >
            {{ formatVolume(preset) }}
          </button>
        </view>
      </view>

      <view class="field-block">
        <text class="field-label">保存预览</text>
        <view class="summary-card goal-preview">
          <text class="summary-label">将保存为</text>
          <text class="summary-value">{{ previewGoalText }}</text>
          <text class="summary-note">建议把目标设置为你一天内更容易坚持的数值。</text>
        </view>
      </view>

      <text v-if="errorMessage" class="form-error">{{ errorMessage }}</text>

      <view class="button-row goal-actions">
        <button class="ghost-btn" @click="goBack">取消</button>
        <button class="primary-btn" @click="saveGoal">保存目标</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { goalPresets, unitOptions } from "@/constants/water";
import { getDailyWaterGoal, saveDailyWaterGoal } from "@/services/water";
import {
  convertToMl,
  formatDateKey,
  formatFullDate,
  formatVolume,
} from "@/utils/water";

const amountInput = ref("2");
const unitIndex = ref(1);
const errorMessage = ref("");
const todayTimestamp = ref(Date.now());

const unitLabels = unitOptions.map((item) => item.label);
const todayKey = computed(() => formatDateKey(todayTimestamp.value));
const todayLabel = computed(() => formatFullDate(todayTimestamp.value));
const activeUnit = computed(() => unitOptions[unitIndex.value]?.value ?? "ml");
const previewGoalMl = computed(() =>
  convertToMl(Number(amountInput.value), activeUnit.value),
);
const previewGoalText = computed(() =>
  previewGoalMl.value > 0 ? formatVolume(previewGoalMl.value) : "尚未输入有效目标",
);

function syncGoalForm(targetMl: number) {
  if (targetMl >= 1000) {
    amountInput.value = `${targetMl / 1000}`;
    unitIndex.value = 1;
    return;
  }

  amountInput.value = `${targetMl}`;
  unitIndex.value = 0;
}

function loadGoal() {
  todayTimestamp.value = Date.now();
  const targetMl = getDailyWaterGoal(todayKey.value)?.targetMl ?? 2000;
  syncGoalForm(targetMl);
  errorMessage.value = "";
}

function handleUnitChange(event: { detail: { value: string } }) {
  unitIndex.value = Number(event.detail.value);
}

function applyPreset(targetMl: number) {
  syncGoalForm(targetMl);
  errorMessage.value = "";
}

function saveGoal() {
  if (previewGoalMl.value <= 0) {
    errorMessage.value = "请输入有效的每日目标。";
    return;
  }

  saveDailyWaterGoal({
    goalDate: todayKey.value,
    targetMl: previewGoalMl.value,
  });

  uni.showToast({
    title: "目标已保存",
    icon: "success",
  });

  setTimeout(() => {
    uni.navigateBack();
  }, 220);
}

function goBack() {
  uni.navigateBack();
}

onShow(() => {
  loadGoal();
});
</script>

<style scoped>
.goal-preview {
  width: 100%;
}

.goal-actions {
  margin-top: 24rpx;
}
</style>
