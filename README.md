# SipVault uni-app

SipVault 现在已经切换为 `uni-app + Vue 3 + TypeScript` 结构，重点面向 Android 打包与移动端运行。

## 当前能力

- 今日饮水目标管理
- 水源容器管理
- 饮水记录与剩余水量联动
- 基于 `uni.setStorageSync` 的本地持久化

## 开发命令

```bash
npm install
npm run dev:h5
npm run dev:app-plus
npm run build:app-plus
```

## 项目结构

```text
src/pages/           uni-app 页面
src/constants/       枚举与选项常量
src/services/        本地存储与业务服务
src/styles/          全局样式
src/types/           类型定义
src/utils/           格式化与业务工具
src/manifest.json    uni-app 应用打包配置
src/pages.json       页面与 tabBar 配置
```
