import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  "stories": [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/**/*.mdx"
  ],
  "addons": [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/nextjs",
  "staticDirs": ["..\\public"]
};
export default config;