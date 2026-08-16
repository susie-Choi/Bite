import { Situation } from "@/types";

export const situations: Situation[] = [
  {
    id: "light_breakfast",
    label: "간단한 아침",
    emoji: "🌅",
    description: "가볍게 하루를 시작할 때",
  },
  {
    id: "hearty_meal",
    label: "든든한 한 끼",
    emoji: "🍱",
    description: "배부르게 먹고 싶을 때",
  },
  {
    id: "late_night",
    label: "가벼운 야식",
    emoji: "🌙",
    description: "늦은 밤 출출할 때",
  },
  {
    id: "on_the_go",
    label: "이동하면서 먹기",
    emoji: "🚶",
    description: "걸으면서 간편하게",
  },
  {
    id: "with_alcohol",
    label: "술과 같이 먹기",
    emoji: "🍺",
    description: "안주가 필요할 때",
  },
  {
    id: "budget_friendly",
    label: "가성비 있게 먹기",
    emoji: "💰",
    description: "저렴하고 만족스러운 한 끼",
  },
];
