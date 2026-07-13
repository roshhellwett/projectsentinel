import type { Meta, StoryObj } from "@storybook/react";
import { ReadingTime } from "../ReadingTime";

const meta: Meta<typeof ReadingTime> = {
  title: "News/ReadingTime",
  component: ReadingTime,
};

export default meta;
type Story = StoryObj<typeof ReadingTime>;

export const QuickRead: Story = {
  args: { text: "Short text." },
};

export const TwoMinutes: Story = {
  args: { text: Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ") },
};

export const LongArticle: Story = {
  args: { text: Array.from({ length: 1000 }, (_, i) => `word${i}`).join(" ") },
};

export const EmptyText: Story = {
  args: { text: "" },
};
