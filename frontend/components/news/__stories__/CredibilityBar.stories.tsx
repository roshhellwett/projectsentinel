import type { Meta, StoryObj } from "@storybook/react";
import { CredibilityBar } from "../CredibilityBar";

const meta: Meta<typeof CredibilityBar> = {
  title: "News/CredibilityBar",
  component: CredibilityBar,
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof CredibilityBar>;

export const HighScore: Story = {
  args: { score: 90 },
};

export const MediumScore: Story = {
  args: { score: 55 },
};

export const LowScore: Story = {
  args: { score: 20 },
};

export const Compact: Story = {
  args: { score: 72, compact: true },
};
