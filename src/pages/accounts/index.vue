<template>
  <view class="page-shell page-shell--tab">
    <view class="app-topbar">
      <view class="app-topbar__brand">
        <image class="app-topbar__logo" src="/static/logo.svg" mode="aspectFit" />
        <text class="app-topbar__title">SipVault</text>
      </view>
      <view class="app-topbar__status">
        <view class="app-topbar__status-dot"></view>
        <text class="app-topbar__status-text">SOURCE INDEX</text>
      </view>
    </view>

    <view class="surface-shell">
      <view class="accounts-header">
        <view>
          <text class="page-title">Add the drinking water you have enabled here</text>
          <text class="page-subtitle">
            Track each container and keep its remaining water updated.
          </text>
        </view>
        <button class="accounts-add-btn" @click="openCreatePage">
          <text>+</text>
        </button>
      </view>

      <view v-if="accounts.length === 0" class="surface-card">
        <view class="empty-card">
          <text class="empty-title">No drinking water added yet</text>
          <text class="empty-copy">
            Use the add button to create your first enabled container.
          </text>
        </view>
      </view>

      <view v-else class="accounts-list">
        <view
          v-for="item in accountItems"
          :key="item.account.id"
          class="surface-card accounts-card"
          :style="{ '--account-status-color': item.statusColor }"
        >
          <view class="accounts-card__layout">
            <view class="accounts-card__body">
              <view class="accounts-card__top">
                <view class="accounts-card__leading">
                  <view class="accounts-card__status-dot"></view>
                  <view class="accounts-card__badge">
                    <text>{{ item.container.shortLabel }}</text>
                  </view>
                  <view>
                    <text class="accounts-card__id">{{ item.account.id }}</text>
                    <text class="accounts-card__brand">{{ item.account.brand }}</text>
                  </view>
                </view>

                <view class="accounts-card__meta">
                  <text class="accounts-card__container">{{ item.container.label }}</text>
                  <text class="accounts-card__status-text">
                    {{ item.hours }} h elapsed
                  </text>
                  <view class="accounts-card__actions">
                    <button class="accounts-card__action-btn" @click="openEditPage(item.account.id)">
                      <text>Edit</text>
                    </button>
                    <button
                      class="accounts-card__action-btn accounts-card__action-btn--danger"
                      @click="confirmDelete(item.account.id)"
                    >
                      <text>Del</text>
                    </button>
                  </view>
                </view>
              </view>

              <view class="accounts-card__grid">
                <view class="accounts-card__item">
                  <text class="accounts-card__label">Initial</text>
                  <text class="accounts-card__value">
                    {{ formatVolume(item.account.initialWaterMl) }}
                  </text>
                </view>
                <view class="accounts-card__item">
                  <text class="accounts-card__label">Remaining</text>
                  <text class="accounts-card__value">
                    {{ formatVolume(item.account.remainingWaterMl) }}
                  </text>
                </view>
                <view class="accounts-card__item">
                  <text class="accounts-card__label">Location</text>
                  <text class="accounts-card__value">{{ item.account.location }}</text>
                </view>
                <view class="accounts-card__item">
                  <text class="accounts-card__label">Start Time</text>
                  <text class="accounts-card__value">{{ item.account.startTimeHours }} h</text>
                </view>
                <view class="accounts-card__item">
                  <text class="accounts-card__label">Recorded</text>
                  <text class="accounts-card__value">{{ formatCreatedAt(item.account.createdAt) }}</text>
                </view>
                <view class="accounts-card__item">
                  <text class="accounts-card__label">Status</text>
                  <text class="accounts-card__value" :style="{ color: item.statusColor }">
                    {{ item.status.label }}
                  </text>
                </view>
              </view>

              <view class="accounts-card__footer">
                <button class="ghost-btn accounts-card__record-btn" @click="openRecordPage(item.account.id)">
                  Record Drink
                </button>
              </view>
            </view>

            <view class="accounts-card__water-meter">
              <view class="accounts-card__water-track">
                <view
                  class="accounts-card__water-fill"
                  :style="{ height: `${item.progress}%` }"
                ></view>
              </view>
              <text class="accounts-card__water-text">
                {{ formatVolume(item.account.remainingWaterMl) }}
              </text>
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
import { deleteWaterAccount, listWaterAccounts } from "@/services/water";
import type { WaterAccountRecord } from "@/types/water";
import {
  formatCreatedAt,
  formatVolume,
  getAccountStatusInfo,
  getContainerOption,
  getHoursSinceCreated,
  getRemainingWaterPercent,
} from "@/utils/water";

const accounts = ref<WaterAccountRecord[]>([]);
const now = ref(Date.now());

function getStatusColor(tone: "success" | "warning" | "danger") {
  switch (tone) {
    case "success":
      return "var(--color-status-active)";
    case "warning":
      return "var(--color-status-pending)";
    case "danger":
    default:
      return "var(--color-status-inactive)";
  }
}

const accountItems = computed(() =>
  accounts.value.map((account) => {
    const status = getAccountStatusInfo(account, now.value);

    return {
      account,
      container: getContainerOption(account.container),
      progress: getRemainingWaterPercent(account),
      status,
      statusColor: getStatusColor(status.tone),
      hours: getHoursSinceCreated(account, now.value),
    };
  }),
);

function loadAccounts() {
  now.value = Date.now();
  accounts.value = listWaterAccounts();
}

function openCreatePage() {
  uni.navigateTo({
    url: "/pages/account-form/index",
  });
}

function openEditPage(id: string) {
  uni.navigateTo({
    url: `/pages/account-form/index?id=${encodeURIComponent(id)}`,
  });
}

function openRecordPage(id: string) {
  uni.navigateTo({
    url: `/pages/record/index?accountId=${encodeURIComponent(id)}`,
  });
}

function confirmDelete(id: string) {
  const account = accounts.value.find((item) => item.id === id);

  if (!account) {
    return;
  }

  uni.showModal({
    title: "Delete source",
    content: `Delete ${account.id}? This will keep the history records but remove the source.`,
    success: ({ confirm }) => {
      if (!confirm) {
        return;
      }

      deleteWaterAccount(id);
      loadAccounts();
      uni.showToast({
        title: "Deleted",
        icon: "success",
      });
    },
  });
}

onShow(() => {
  loadAccounts();
});
</script>

<style scoped>
.accounts-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
  padding: 8rpx 8rpx 16rpx;
}

.accounts-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 74rpx;
  height: 74rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  background: #32332b;
}

.accounts-add-btn text {
  margin-top: -2rpx;
  font-size: 38rpx;
  line-height: 1;
  color: #ffffff;
}

.accounts-list {
  margin-top: 10rpx;
}

.accounts-card + .accounts-card {
  margin-top: 16rpx;
}

.accounts-card__layout {
  display: flex;
  align-items: stretch;
  gap: 18rpx;
}

.accounts-card__body {
  min-width: 0;
  flex: 1;
}

.accounts-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.accounts-card__leading {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.accounts-card__status-dot {
  width: 12rpx;
  height: 12rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--account-status-color);
  box-shadow: 0 0 0 8rpx rgba(76, 175, 80, 0.12);
}

.accounts-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 54rpx;
  padding: 0 14rpx;
  border-radius: 18rpx;
  background: rgba(235, 235, 235, 0.72);
}

.accounts-card__badge text {
  font-size: 20rpx;
  font-weight: 700;
  color: #32332b;
}

.accounts-card__id,
.accounts-card__brand,
.accounts-card__container,
.accounts-card__status-text,
.accounts-card__label,
.accounts-card__water-text {
  display: block;
}

.accounts-card__id {
  font-size: 22rpx;
  font-weight: 800;
  color: #32332b;
  line-height: 1.2;
}

.accounts-card__brand {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: rgba(50, 51, 43, 0.68);
}

.accounts-card__meta {
  text-align: right;
  flex-shrink: 0;
}

.accounts-card__container,
.accounts-card__status-text {
  font-size: 20rpx;
  color: rgba(50, 51, 43, 0.64);
}

.accounts-card__status-text {
  margin-top: 4rpx;
  color: var(--account-status-color);
  font-weight: 700;
}

.accounts-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8rpx;
  margin-top: 10rpx;
}

.accounts-card__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 62rpx;
  min-height: 52rpx;
  padding: 0 14rpx;
  border-radius: 16rpx;
  background: rgba(235, 235, 235, 0.68);
}

.accounts-card__action-btn text {
  font-size: 18rpx;
  font-weight: 700;
  color: #32332b;
}

.accounts-card__action-btn--danger text {
  color: #cb3a31;
}

.accounts-card__grid {
  display: flex;
  flex-wrap: wrap;
  margin: 14rpx -6rpx 0;
}

.accounts-card__item {
  width: 50%;
  padding: 6rpx;
}

.accounts-card__label {
  font-size: 19rpx;
  color: rgba(50, 51, 43, 0.6);
}

.accounts-card__value {
  display: block;
  margin-top: 4rpx;
  font-size: 21rpx;
  font-weight: 700;
  color: #32332b;
  line-height: 1.45;
}

.accounts-card__footer {
  margin-top: 14rpx;
}

.accounts-card__record-btn {
  min-height: 68rpx;
}

.accounts-card__water-meter {
  display: flex;
  min-width: 58rpx;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.accounts-card__water-track {
  position: relative;
  display: flex;
  width: 18rpx;
  flex: 1;
  min-height: 220rpx;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 999rpx;
  background: rgba(130, 190, 255, 0.18);
}

.accounts-card__water-fill {
  width: 100%;
  border-radius: inherit;
  background: linear-gradient(180deg, #9fd4ff 0%, #7ec3ff 100%);
}

.accounts-card__water-text {
  font-size: 18rpx;
  font-weight: 700;
  color: rgba(50, 51, 43, 0.66);
  text-align: center;
}

@media (max-width: 430px) {
  .accounts-header {
    padding-left: 4rpx;
    padding-right: 4rpx;
  }

  .accounts-card__layout {
    gap: 14rpx;
  }

  .accounts-card__water-track {
    min-height: 188rpx;
  }

  .accounts-card__item {
    width: 100%;
  }
}
</style>
