#!/usr/bin/env node
import { rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const cleanupTargets = [
  'tmp',
  'apps/backend/coverage',
  'apps/backend/dist',
  'apps/frontend/.angular',
  'apps/frontend/coverage',
  'apps/frontend/dist',
  'apps/frontend/lighthouse-a11y-report.json',
  'apps/frontend/lighthouse-report.json',
  'apps/landing/.astro',
  'apps/landing/dist',
  'e2e/test-output',
  'libs/shared-types/dist',
  'libs/shared-types/tsconfig.tsbuildinfo',
  'out-tsc',
];

let removedCount = 0;

for (const relativeTarget of cleanupTargets) {
  const absoluteTarget = path.join(repoRoot, relativeTarget);
  if (!existsSync(absoluteTarget)) {
    continue;
  }

  rmSync(absoluteTarget, { recursive: true, force: true });
  removedCount += 1;
  console.log(`removed ${relativeTarget}`);
}

if (removedCount === 0) {
  console.log('nothing to clean');
}
