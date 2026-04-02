import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type EnsureSchemaModule = {
  shouldSeedMotdMakingOfRuntime: (nodeEnv: string | undefined) => boolean;
  getMotdMakingOfSeedFiles: () => string[];
};

const cjsRequire = createRequire(__filename);
const ensureSchema = cjsRequire(
  path.resolve(__dirname, '../../../../scripts/ensure-schema.js'),
) as EnsureSchemaModule;

describe('ensure-schema MOTD runtime seeding', () => {
  it('überspringt Making-of-Re-Seeding in Produktion', () => {
    expect(ensureSchema.shouldSeedMotdMakingOfRuntime('production')).toBe(false);
  });

  it('erlaubt Making-of-Re-Seeding außerhalb der Produktion', () => {
    expect(ensureSchema.shouldSeedMotdMakingOfRuntime('development')).toBe(true);
    expect(ensureSchema.shouldSeedMotdMakingOfRuntime(undefined)).toBe(true);
  });

  it('enthält die Banner-Migration in der Dev-Seed-Liste', () => {
    expect(ensureSchema.getMotdMakingOfSeedFiles()).toContain(
      'prisma/migrations/20260401120000_motd_making_of_banner_image/migration.sql',
    );
  });
});
