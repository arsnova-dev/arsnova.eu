-- CreateEnum (Epic 9, Story 9.2, 9.3: Admin Audit-Log)
CREATE TYPE "AdminAuditAction" AS ENUM ('SESSION_DELETE', 'EXPORT_FOR_AUTHORITIES');

-- CreateTable AdminAuditLog (keine FK zu Session, Snapshot von sessionId/sessionCode)
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "action" "AdminAuditAction" NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sessionCode" TEXT NOT NULL,
    "adminIdentifier" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
