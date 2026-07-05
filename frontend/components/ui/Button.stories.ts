import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Click me', variant: 'default' },
};

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary' },
};

export const Outline: Story = {
  args: { children: 'Browse', variant: 'outline' },
};

export const Ghost: Story = {
  args: { children: 'Learn more', variant: 'ghost' },
};

export const Destructive: Story = {
  args: { children: 'Delete', variant: 'destructive' },
};

export const Link: Story = {
  args: { children: 'View details', variant: 'link' },
};

export const Small: Story = {
  args: { children: 'OK', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Submit', size: 'lg' },
};

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};
