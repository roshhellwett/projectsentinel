import type { Meta, StoryObj } from "@storybook/react";
import { VerificationStamp } from "../VerificationStamp";

const meta: Meta<typeof VerificationStamp> = {
  title: "UI/VerificationStamp",
  component: VerificationStamp,
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof VerificationStamp>;

export const HighCredibility: Story = {
  args: { score: 85 },
};

export const MediumCredibility: Story = {
  args: { score: 55 },
};

export const LowCredibility: Story = {
  args: { score: 25 },
};
