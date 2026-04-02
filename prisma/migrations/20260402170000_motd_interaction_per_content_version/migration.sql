ALTER TABLE "MotdInteractionCounter"
ADD COLUMN "contentVersion" INTEGER;

UPDATE "MotdInteractionCounter" mic
SET "contentVersion" = m."contentVersion"
FROM "Motd" m
WHERE m."id" = mic."motdId";

ALTER TABLE "MotdInteractionCounter"
ALTER COLUMN "contentVersion" SET NOT NULL;

ALTER TABLE "MotdInteractionCounter"
DROP CONSTRAINT "MotdInteractionCounter_pkey";

ALTER TABLE "MotdInteractionCounter"
ADD CONSTRAINT "MotdInteractionCounter_pkey" PRIMARY KEY ("motdId", "contentVersion");

CREATE INDEX "MotdInteractionCounter_motdId_idx" ON "MotdInteractionCounter"("motdId");