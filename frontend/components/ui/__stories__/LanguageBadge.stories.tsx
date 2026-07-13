import type { Meta, StoryObj } from "@storybook/react";
import { LanguageBadge } from "../LanguageBadge";

const meta: Meta<typeof LanguageBadge> = {
  title: "UI/LanguageBadge",
  component: LanguageBadge,
};

export default meta;
type Story = StoryObj<typeof LanguageBadge>;

export const Hindi: Story = {
  args: { language: "hi" },
};

export const Bengali: Story = {
  args: { language: "bn" },
};

export const Tamil: Story = {
  args: { language: "ta" },
};

export const EnglishHidden: Story = {
  args: { language: "en" },
};

export const NullHidden: Story = {
  args: { language: null },
};
