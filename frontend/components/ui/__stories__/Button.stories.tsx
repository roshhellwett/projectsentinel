import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "outline", "ghost", "destructive", "link"] },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Click me", variant: "default" },
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

export const Destructive: Story = {
  args: { children: "Delete", variant: "destructive" },
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
