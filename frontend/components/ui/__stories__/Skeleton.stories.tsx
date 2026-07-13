import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "../Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const TextLine: Story = {
  args: { className: "h-4 w-64" },
};

export const Avatar: Story = {
  args: { className: "h-10 w-10 rounded-full" },
};

export const Card: Story = {
  args: { className: "h-48 w-80" },
};

export const MultipleLines: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};
