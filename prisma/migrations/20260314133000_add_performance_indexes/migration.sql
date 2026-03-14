-- PR 2: Gezielte Performance-Indizes für häufige Produktions-Queries
CREATE INDEX IF NOT EXISTS "Question_quizId_order_idx"
ON "Question" ("quizId", "order");

CREATE INDEX IF NOT EXISTS "Session_status_startedAt_id_idx"
ON "Session" ("status", "startedAt", "id");

CREATE INDEX IF NOT EXISTS "Session_status_endedAt_idx"
ON "Session" ("status", "endedAt");

CREATE INDEX IF NOT EXISTS "Session_legalHoldUntil_idx"
ON "Session" ("legalHoldUntil");

CREATE INDEX IF NOT EXISTS "Vote_sessionId_questionId_round_idx"
ON "Vote" ("sessionId", "questionId", "round");

CREATE INDEX IF NOT EXISTS "Vote_participantId_votedAt_idx"
ON "Vote" ("participantId", "votedAt");

CREATE INDEX IF NOT EXISTS "BonusToken_generatedAt_idx"
ON "BonusToken" ("generatedAt");

CREATE INDEX IF NOT EXISTS "QaQuestion_sessionId_status_createdAt_idx"
ON "QaQuestion" ("sessionId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "QaQuestion_sessionId_participantId_idx"
ON "QaQuestion" ("sessionId", "participantId");

CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx"
ON "AdminAuditLog" ("createdAt");

CREATE INDEX IF NOT EXISTS "AdminAuditLog_sessionCode_createdAt_idx"
ON "AdminAuditLog" ("sessionCode", "createdAt");
