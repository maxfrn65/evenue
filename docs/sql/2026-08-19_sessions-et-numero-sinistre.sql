-- Evenue — évolution de schéma du 19/08/2026
--
-- Généré par :
--   npx prisma migrate diff --from-schema <schéma déployé> --to-schema prisma/schema.prisma --script
--
-- Contenu :
--   * model Session                  — sessions serveur à jeton opaque (OWASP A07)
--   * Claim.claimNumber              — numéro de dossier sinistre persisté
--   * InsuranceStatus.UNDER_REVIEW   — statut d'un sinistre contesté
--
-- Additif uniquement : aucune colonne ni table supprimée, aucune donnée réécrite.
-- Seul effet visible : les sessions ouvertes avec l'ancien cookie deviennent invalides,
-- les utilisateurs connectés devront se reconnecter.

-- AlterEnum
ALTER TYPE "InsuranceStatus" ADD VALUE 'UNDER_REVIEW';

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "claimNumber" TEXT;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

