import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "outline", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Click me", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Cancel", variant: "secondary" },
};

export const Outline: Story = {
  args: { children: "Learn more", variant: "outline" },
};

export const Ghost: Story = {
  args: { children: "Dismiss", variant: "ghost" },
};

export const Danger: Story = {
  args: { children: "Delete", variant: "danger" },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

export const Large: Story = {
  args: { children: "Large", size: "lg" },
};
