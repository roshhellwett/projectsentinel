import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "../Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const SingleItem: Story = {
  args: { items: [{ label: "Page" }] },
};

export const WithLinks: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Category", href: "/category/tech" },
      { label: "Current" },
    ],
  },
};

export const DeepPath: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "News", href: "/news" },
      { label: "Science", href: "/category/science" },
      { label: "Article Title" },
    ],
  },
};
