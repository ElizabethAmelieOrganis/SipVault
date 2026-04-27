<template>
  <view class="page-shell">
    <view class="page-header">
      <text class="page-title">{{ isEditing ? "编辑水源" : "新增水源" }}</text>
      <text class="page-subtitle">
        {{
          isEditing
            ? "更新容器信息后，SipVault 会继续沿用原来的历史时间和饮水记录。"
            : "创建一个你正在使用的水源，后续记录饮水时就能直接选择。"
        }}
      </text>
    </view>

    <view class="surface-card">
      <view class="field-block">
        <text class="field-label">容器类型</text>
        <picker
          :range="containerLabels"
          :value="containerIndex"
          @change="handleContainerChange"
        >
          <view class="field-picker">{{ containerLabels[containerIndex] }}</view>
        </picker>
      </view>

      <view class="field-block">
        <text class="field-label">品牌或名称</text>
        <input
          v-model.trim="brand"
          class="field-input"
          type="text"
          placeholder="例如 农夫山泉 / 保温杯 / 床头杯"
        />
      </view>

      <view class="field-block">
        <text class="field-label">初始水量（mL）</text>
        <input
          v-model="initialWaterMlInput"
          class="field-input"
          type="number"
          placeholder="例如 500"
        />
      </view>

      <view class="field-block">
        <text class="field-label">当前剩余（mL）</text>
        <input
          v-model="remainingWaterMlInput"
          class="field-input"
          type="number"
          placeholder="例如 500"
        />
      </view>

      <view class="field-block">
        <text class="field-label">放置位置</text>
        <input
          v-model.trim="location"
          class="field-input"
          type="text"
          placeholder="例如 办公桌 / 床头 / 厨房"
        />
      </view>

      <view class="field-block">
        <text class="field-label">已经放置时长（小时）</text>
        <input
          v-model="startTimeHoursInput"
          class="field-input"
          type="number"
          placeholder="例如 0"
        />
        <text class="field-hint">
          如果这个容器不是刚刚装满的，可以补录它已经放置了多久。
        </text>
      </view>

      <text v-if="errorMessage" class="form-error">{{ errorMessage }}</text>

      <view class="button-row account-form__actions">
        <button class="ghost-btn" @click="goBack">取消</button>
        <button class="primary-btn" @click="saveAccount">
          {{ isEditing ? "保存修改" : "创建水源" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { containerOptions } from "@/constants/water";
import {
  createWaterAccount,
  getWaterAccountById,
  updateWaterAccount,
} from "@/services/water";
import {
  createAccountId,
  normalizeInteger,
} from "@/utils/water";

const editingId = ref("");
const containerIndex = ref(0);
const brand = ref("");
const initialWaterMlInput = ref("500");
const remainingWaterMlInput = ref("500");
const location = ref("");
const startTimeHoursInput = ref("0");
const errorMessage = ref("");

const containerLabels = containerOptions.map((item) => item.label);
const isEditing = computed(() => editingId.value.length > 0);

function loadForm() {
  if (!isEditing.value) {
    return;
  }

  const current = getWaterAccountById(editingId.value);

  if (!current) {
    uni.showToast({
      title: "未找到该水源",
      icon: "none",
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 180);
    return;
  }

  containerIndex.value = containerOptions.findIndex(
    (option) => option.value === current.container,
  );
  brand.value = current.brand;
  initialWaterMlInput.value = `${current.initialWaterMl}`;
  remainingWaterMlInput.value = `${current.remainingWaterMl}`;
  location.value = current.location;
  startTimeHoursInput.value = `${current.startTimeHours}`;
}

function handleContainerChange(event: { detail: { value: string } }) {
  containerIndex.value = Number(event.detail.value);
}

function saveAccount() {
  if (!brand.value || !location.value) {
    errorMessage.value = "请补全品牌名称和放置位置。";
    return;
  }

  const initialWaterMl = normalizeInteger(Number(initialWaterMlInput.value));
  const remainingWaterMl = normalizeInteger(Number(remainingWaterMlInput.value));
  const startTimeHours = normalizeInteger(Number(startTimeHoursInput.value));

  if (initialWaterMl <= 0) {
    errorMessage.value = "初始水量必须大于 0。";
    return;
  }

  if (remainingWaterMl > initialWaterMl) {
    errorMessage.value = "当前剩余水量不能大于初始水量。";
    return;
  }

  const container = containerOptions[containerIndex.value]?.value ?? "plastic-bottle";

  if (isEditing.value) {
    updateWaterAccount(editingId.value, {
      container,
      brand: brand.value,
      initialWaterMl,
      remainingWaterMl,
      location: location.value,
      startTimeHours,
    });
  } else {
    createWaterAccount({
      id: createAccountId(),
      container,
      brand: brand.value,
      initialWaterMl,
      remainingWaterMl,
      location: location.value,
      startTimeHours,
    });
  }

  uni.showToast({
    title: isEditing.value ? "已保存" : "已创建",
    icon: "success",
  });

  setTimeout(() => {
    uni.navigateBack();
  }, 220);
}

function goBack() {
  uni.navigateBack();
}

onLoad((options) => {
  editingId.value = typeof options?.id === "string" ? options.id : "";
  loadForm();
});
</script>

<style scoped>
.account-form__actions {
  margin-top: 24rpx;
}
</style>
