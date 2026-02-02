export type StubshotConfig = {
  provider: string;
  outDir: string;
  count: number;
  sizes?: string;
  width?: number;
  height?: number;
  aspect?: string;
  theme: string;
  format: string;
  prefix: string;
  padding: number;
  startIndex: number;
  seed: string;
  manifest?: string | boolean;
  dryRun: boolean;
  overwrite: boolean;
  silent: boolean;
  verbose: boolean;
  concurrency: number;
};

export type StubshotConfigOverrides = Partial<StubshotConfig>;
