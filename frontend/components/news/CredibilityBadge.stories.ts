import type { Meta, StoryObj } from '@storybook/nextjs';
import { CredibilityBadge } from './CredibilityBadge';

const meta: Meta<typeof CredibilityBadge> = {
  title: 'News/CredibilityBadge',
  component: CredibilityBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CredibilityBadge>;

export const High: Story = {
  args: { score: 92 },
};

export const Medium: Story = {
  args: { score: 65 },
};

export const Low: Story = {
  args: { score: 35 },
};

export const Compact: Story = {
  args: { score: 88, compact: true },
};
