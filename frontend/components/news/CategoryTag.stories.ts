import type { Meta, StoryObj } from '@storybook/nextjs';
import { CategoryTag } from './CategoryTag';

const meta: Meta<typeof CategoryTag> = {
  title: 'News/CategoryTag',
  component: CategoryTag,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: ['politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world', 'entertainment', 'education'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CategoryTag>;

export const Politics: Story = { args: { category: 'politics' } };
export const Tech: Story = { args: { category: 'tech' } };
export const Sports: Story = { args: { category: 'sports' } };
export const Science: Story = { args: { category: 'science' } };
export const Business: Story = { args: { category: 'business' } };
export const Crime: Story = { args: { category: 'crime' } };
export const Health: Story = { args: { category: 'health' } };
export const World: Story = { args: { category: 'world' } };
export const Entertainment: Story = { args: { category: 'entertainment' } };
export const Education: Story = { args: { category: 'education' } };
