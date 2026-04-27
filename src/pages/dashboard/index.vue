<template>
  <view class="page-shell page-shell--tab">
    <view class="app-topbar">
      <view class="app-topbar__brand">
        <image class="app-topbar__logo" src="/static/logo.svg" mode="aspectFit" />
        <text class="app-topbar__title">SipVault</text>
      </view>
      <view class="app-topbar__status">
        <view class="app-topbar__status-dot"></view>
        <text class="app-topbar__status-text">LOCAL READY</text>
      </view>
    </view>

    <view class="surface-shell">
      <view class="dashboard-date">
        <text class="dashboard-date__text">{{ todayLabel }}</text>
      </view>

      <view class="dashboard-main">
        <view class="surface-card dashboard-body-panel">
          <view class="dashboard-body-panel__figure">
            <view class="dashboard-body-meter">
              <svg
                class="dashboard-body-meter__svg"
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
              <view class="dashboard-body-meter__badge">
                <text>{{
                  goalProgressPercent >= 100 ? "Hydrated" : `${goalProgressPercent}%`
                }}</text>
              </view>
            </view>
          </view>

          <view class="dashboard-metrics">
            <button class="dashboard-metric dashboard-metric--button" @click="openGoalPage">
              <text class="dashboard-metric__label">Today's goal</text>
              <text class="dashboard-metric__value">{{ formatVolume(activeGoalMl) }}</text>
            </button>

            <view class="dashboard-metric">
              <text class="dashboard-metric__label">Today's intake</text>
              <text class="dashboard-metric__value">{{ formatVolume(todayConsumedMl) }}</text>
            </view>
          </view>

          <view class="dashboard-progress-meta">
            <text>{{ goalProgressPercent }}%</text>
            <text>
              {{
                remainingToGoalMl > 0
                  ? `${formatVolume(remainingToGoalMl)} to goal`
                  : "Goal reached"
              }}
            </text>
          </view>

          <view class="progress-track">
            <view class="progress-fill" :style="goalFillStyle"></view>
          </view>
        </view>

        <view class="surface-card dashboard-records-panel">
          <view class="dashboard-records-panel__header">
            <view>
              <text class="section-title">Today's Drinks</text>
              <text class="section-copy">
                Time, source, and actual consumed amount for today.
              </text>
            </view>
            <button class="dashboard-add-btn" :disabled="!hasAccounts" @click="openRecordPage">
              <text>+</text>
            </button>
          </view>

          <view v-if="records.length === 0" class="empty-card dashboard-empty">
            <text class="empty-title">No drinks logged today</text>
            <text class="empty-copy">
              {{
                hasAccounts
                  ? `Tap the add button to create your first record for ${todayShortLabel}.`
                  : "Create a water source first, then come back to record your drinks."
              }}
            </text>
          </view>

          <view v-else class="dashboard-records">
            <view v-for="record in records" :key="record.id" class="dashboard-record-card">
              <view class="dashboard-record-card__top">
                <view>
                  <text class="dashboard-record-card__time">
                    {{ formatClock(record.occurredAt) }}
                  </text>
                  <text class="dashboard-record-card__title">{{ record.accountBrand }}</text>
                </view>
                <text class="dashboard-record-card__amount">
                  {{ formatVolume(record.consumedMl) }}
                </text>
              </view>

              <view class="dashboard-record-card__bottom">
                <text>{{ record.mode === "exact" ? "Exact amount" : record.note || "Estimated" }}</text>
                <text>{{ formatVolume(record.sourceRemainingAfterMl) }} left</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
  getDailyWaterGoal,
  listWaterAccounts,
  listWaterIntakeRecordsByDate,
} from "@/services/water";
import type { WaterAccountRecord, WaterIntakeRecord } from "@/types/water";
import {
  formatClock,
  formatDateKey,
  formatFullDate,
  formatShortDate,
  formatVolume,
} from "@/utils/water";

const now = ref(Date.now());
const accounts = ref<WaterAccountRecord[]>([]);
const records = ref<WaterIntakeRecord[]>([]);
const activeGoalMl = ref(2000);

const todayKey = computed(() => formatDateKey(now.value));
const todayLabel = computed(() => formatFullDate(now.value));
const todayShortLabel = computed(() => formatShortDate(now.value));
const todayConsumedMl = computed(() =>
  records.value.reduce((total, record) => total + record.consumedMl, 0),
);
const goalProgressPercent = computed(() => {
  if (activeGoalMl.value <= 0) {
    return 0;
  }

  const ratio = (todayConsumedMl.value / activeGoalMl.value) * 100;
  return Math.min(Math.max(Math.round(ratio), 0), 100);
});
const bodyFillHeight = computed(() => (280 * goalProgressPercent.value) / 100);
const goalFillStyle = computed(() => ({
  width: `${goalProgressPercent.value}%`,
}));
const remainingToGoalMl = computed(() =>
  Math.max(activeGoalMl.value - todayConsumedMl.value, 0),
);
const hasAccounts = computed(() => accounts.value.length > 0);

function loadDashboard() {
  now.value = Date.now();
  accounts.value = listWaterAccounts();
  records.value = listWaterIntakeRecordsByDate(todayKey.value);
  activeGoalMl.value = getDailyWaterGoal(todayKey.value)?.targetMl ?? 2000;
}

function openGoalPage() {
  uni.navigateTo({
    url: "/pages/goal/index",
  });
}

function openRecordPage() {
  if (!hasAccounts.value) {
    openAccountsPage();
    return;
  }

  uni.navigateTo({
    url: "/pages/record/index",
  });
}

function openAccountsPage() {
  uni.switchTab({
    url: "/pages/accounts/index",
  });
}

onShow(() => {
  loadDashboard();
});
</script>

<style scoped>
.dashboard-date {
  display: flex;
  justify-content: center;
  padding: 4rpx 0 16rpx;
}

.dashboard-date__text {
  font-size: 24rpx;
  font-weight: 700;
  color: rgba(50, 51, 43, 0.88);
  text-align: center;
}

.dashboard-main {
  display: flex;
  align-items: stretch;
  gap: 16rpx;
}

.dashboard-body-panel {
  width: 39%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.dashboard-records-panel {
  width: 61%;
  display: flex;
  flex-direction: column;
}

.dashboard-body-panel__figure {
  display: flex;
  justify-content: flex-start;
}

.dashboard-body-meter {
  position: relative;
  width: 100%;
  min-width: 180rpx;
}

.dashboard-body-meter__svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 16rpx 30rpx rgba(92, 171, 255, 0.16));
}

.dashboard-body-meter__badge {
  position: absolute;
  left: 50%;
  bottom: 8rpx;
  transform: translateX(-50%);
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(50, 51, 43, 0.92);
}

.dashboard-body-meter__badge text {
  font-size: 20rpx;
  font-weight: 700;
  color: #ffffff;
}

.dashboard-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.dashboard-metric {
  display: flex;
  min-height: 74rpx;
  flex: 1 1 100%;
  flex-direction: column;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx 14rpx;
  border-radius: 20rpx;
  background: rgba(248, 248, 248, 0.96);
  text-align: left;
}

.dashboard-metric--button {
  border: 0;
}

.dashboard-metric__label {
  font-size: 20rpx;
  color: rgba(50, 51, 43, 0.64);
}

.dashboard-metric__value {
  font-size: 24rpx;
  font-weight: 800;
  color: #32332b;
}

.dashboard-progress-meta {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-top: 14rpx;
  margin-bottom: 10rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: #32332b;
}

.dashboard-records-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.dashboard-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 74rpx;
  height: 74rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  background: #32332b;
}

.dashboard-add-btn text {
  margin-top: -2rpx;
  font-size: 38rpx;
  line-height: 1;
  color: #ffffff;
}

.dashboard-add-btn[disabled] {
  opacity: 0.45;
}

.dashboard-empty {
  min-height: 420rpx;
  margin-top: 18rpx;
  justify-content: center;
}

.dashboard-records {
  margin-top: 16rpx;
}

.dashboard-record-card + .dashboard-record-card {
  margin-top: 12rpx;
}

.dashboard-record-card {
  padding: 18rpx;
  border-radius: 22rpx;
  background: rgba(244, 244, 244, 0.9);
}

.dashboard-record-card__top,
.dashboard-record-card__bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.dashboard-record-card__time,
.dashboard-record-card__bottom {
  font-size: 21rpx;
  color: rgba(50, 51, 43, 0.68);
}

.dashboard-record-card__time {
  display: block;
}

.dashboard-record-card__title {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  font-weight: 800;
  color: #32332b;
}

.dashboard-record-card__amount {
  font-size: 22rpx;
  font-weight: 800;
  color: #32332b;
}

.dashboard-record-card__bottom {
  margin-top: 10rpx;
}

@media (max-width: 430px) {
  .dashboard-main {
    gap: 12rpx;
  }

  .dashboard-body-panel {
    width: 38%;
  }

  .dashboard-records-panel {
    width: 62%;
  }

  .dashboard-body-meter {
    min-width: 144rpx;
  }

  .dashboard-metric {
    min-height: 66rpx;
    padding: 10rpx 12rpx;
  }

  .dashboard-metric__value {
    font-size: 21rpx;
  }

  .dashboard-record-card {
    padding: 16rpx;
  }

  .dashboard-record-card__bottom {
    flex-direction: column;
    gap: 4rpx;
  }
}
</style>
