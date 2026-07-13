module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'ci',
        'build',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'frontend',
        'worker',
        'supabase',
        'ci',
        'deps',
        'docs',
        'root',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
