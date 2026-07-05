import type { Meta, StoryObj } from '@storybook/nextjs';
import { ScoreRing } from './ScoreRing';

const meta: Meta<typeof ScoreRing> = {
  title: 'News/ScoreRing',
  component: ScoreRing,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: { type: 'range', min: 20, max: 120, step: 4 } },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ScoreRing>;

export const High: Story = {
  args: { score: 95, size: 60 },
};

export const Medium: Story = {
  args: { score: 68, size: 60 },
};

export const Low: Story = {
  args: { score: 32, size: 60 },
};

export const CompactRing: Story = {
  args: { score: 88, size: 40, compact: true },
};

export const Large: Story = {
  args: { score: 78, size: 100 },
};
