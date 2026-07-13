module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/category/tech/",
        "http://localhost:3000/search",
        "http://localhost:3000/how-it-works/",
      ],
      numberOfRuns: 2,
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["warn", { minScore: 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.85 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci-artifacts",
    },
  },
};
