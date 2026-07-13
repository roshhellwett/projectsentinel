import type { Meta, StoryObj } from "@storybook/react";
import { CredibilityBadge } from "../CredibilityBadge";

const meta: Meta<typeof CredibilityBadge> = {
  title: "News/CredibilityBadge",
  component: CredibilityBadge,
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof CredibilityBadge>;

export const HighScore: Story = {
  args: { score: 92, showTooltip: true },
};

export const MediumScore: Story = {
  args: { score: 58 },
};

export const LowScore: Story = {
  args: { score: 22, showTooltip: true },
};

export const Compact: Story = {
  args: { score: 75, compact: true },
};
