import type { WaterAccountContainer } from "@/types/water";

export const containerOptions = [
  {
    value: "plastic-bottle",
    label: "瓶装水",
    shortLabel: "Bottle",
  },
  {
    value: "can",
    label: "罐装饮品",
    shortLabel: "Can",
  },
  {
    value: "cup",
    label: "杯子",
    shortLabel: "Cup",
  },
  {
    value: "other",
    label: "其他容器",
    shortLabel: "Other",
  },
] as const satisfies ReadonlyArray<{
  value: WaterAccountContainer;
  label: string;
  shortLabel: string;
}>;

export const unitOptions = [
  {
    label: "mL",
    value: "ml",
  },
  {
    label: "L",
    value: "l",
  },
] as const;

export type VolumeUnit = (typeof unitOptions)[number]["value"];

export const estimatedOptions = [
  {
    value: "sip",
    label: "喝一小口",
    description: "按 70 mL 记录，适合快速补水。",
  },
  {
    value: "leave-three-quarters",
    label: "剩 3/4",
    description: "按当前剩余水量的 1/4 记录。",
  },
  {
    value: "leave-half",
    label: "剩一半",
    description: "按当前剩余水量的 1/2 记录。",
  },
  {
    value: "leave-third",
    label: "剩 1/3",
    description: "按喝到只剩三分之一来估算。",
  },
  {
    value: "leave-quarter",
    label: "剩 1/4",
    description: "按喝掉当前剩余水量的 3/4 记录。",
  },
  {
    value: "finish",
    label: "全部喝完",
    description: "把当前容器剩余水量一次记完。",
  },
] as const;

export type EstimatedOptionValue = (typeof estimatedOptions)[number]["value"];

export const goalPresets = [1500, 2000, 2500, 3000] as const;
