import type { Meta, StoryObj } from '@storybook/nextjs';
import { FeedSkeleton } from '../news/InfiniteFeed';

const meta: Meta<typeof FeedSkeleton> = {
  title: 'UI/Skeleton',
  component: FeedSkeleton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeedSkeleton>;

export const FeedCard: Story = {};
