-- AlterEnum
BEGIN;
-- assinantes do antigo plano Oráculo passam para o plano único (Místico)
UPDATE "User" SET "plan" = 'MISTICO' WHERE "plan"::text = 'ORACULO';
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'MISTICO');
ALTER TABLE "public"."User" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "User" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "Dream" ALTER COLUMN "interpretation" DROP NOT NULL,
ALTER COLUMN "keySymbolism" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trialUsedAt" TIMESTAMP(3);

