import type { Meta, StoryObj } from "@storybook/react";
import { BookmarkButton } from "../BookmarkButton";

const meta: Meta<typeof BookmarkButton> = {
  title: "News/BookmarkButton",
  component: BookmarkButton,
};

export default meta;
type Story = StoryObj<typeof BookmarkButton>;

export const IconVariant: Story = {
  args: { postId: "test-1", variant: "icon" },
};

export const PillVariant: Story = {
  args: { postId: "test-2", variant: "pill" },
};
