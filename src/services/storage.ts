function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key);

    if (value === "" || value === undefined || value === null) {
      return cloneValue(fallback);
    }

    return value as T;
  } catch (error) {
    console.error(`Failed to read storage key: ${key}`, error);
    return cloneValue(fallback);
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, value);
  } catch (error) {
    console.error(`Failed to write storage key: ${key}`, error);
    throw new Error("本地数据保存失败，请稍后重试。");
  }
}
