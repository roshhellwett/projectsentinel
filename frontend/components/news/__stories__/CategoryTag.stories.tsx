import type { Meta, StoryObj } from "@storybook/react";
import { CategoryTag } from "../CategoryTag";

const meta: Meta<typeof CategoryTag> = {
  title: "News/CategoryTag",
  component: CategoryTag,
};

export default meta;
type Story = StoryObj<typeof CategoryTag>;

export const Politics: Story = {
  args: { category: "politics" },
};

export const Tech: Story = {
  args: { category: "tech" },
};

export const Sports: Story = {
  args: { category: "sports" },
};

export const Science: Story = {
  args: { category: "science" },
};

export const Health: Story = {
  args: { category: "health" },
};

export const Business: Story = {
  args: { category: "business" },
};
