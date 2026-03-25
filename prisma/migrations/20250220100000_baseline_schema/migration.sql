-- Vollständiges Schema aus prisma/schema.prisma (Prisma migrate diff --from-empty --to-schema).
-- Ersetzt die frühere, lückenhafte Kette: die erste Migration wies auf "Quiz" ohne vorherige CREATE TABLE.
--
-- Bereits deployte Umgebungen mit alten Einträgen in _prisma_migrations: nicht diese Datei erneut ausführen;
-- stattdessen Migration-Historie angleichen (z. B. Einmal-SQL aus diff gegen Live-DB oder Support von Prisma).

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'FREETEXT', 'SURVEY', 'RATING');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('LOBBY', 'QUESTION_OPEN', 'ACTIVE', 'PAUSED', 'RESULTS', 'DISCUSSION', 'FINISHED');

-- CreateEnum
CREATE TYPE "NicknameTheme" AS ENUM ('NOBEL_LAUREATES', 'KINDERGARTEN', 'PRIMARY_SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL');

-- CreateEnum
CREATE TYPE "TeamAssignment" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('QUIZ', 'Q_AND_A');

-- CreateEnum
CREATE TYPE "QaVoteDirection" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "QaQuestionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PINNED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "AdminAuditAction" AS ENUM ('SESSION_DELETE', 'EXPORT_FOR_AUTHORITIES');

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "motifImageUrl" TEXT,
    "showLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "allowCustomNicknames" BOOLEAN NOT NULL DEFAULT true,
    "defaultTimer" INTEGER,
    "enableSoundEffects" BOOLEAN NOT NULL DEFAULT true,
    "enableRewardEffects" BOOLEAN NOT NULL DEFAULT true,
    "enableMotivationMessages" BOOLEAN NOT NULL DEFAULT true,
    "enableEmojiReactions" BOOLEAN NOT NULL DEFAULT true,
    "anonymousMode" BOOLEAN NOT NULL DEFAULT false,
    "teamMode" BOOLEAN NOT NULL DEFAULT false,
    "teamCount" INTEGER,
    "teamAssignment" "TeamAssignment" NOT NULL DEFAULT 'AUTO',
    "teamNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "backgroundMusic" TEXT,
    "nicknameTheme" "NicknameTheme" NOT NULL DEFAULT 'NOBEL_LAUREATES',
    "bonusTokenCount" INTEGER,
    "readingPhaseEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preset" TEXT NOT NULL DEFAULT 'PLAYFUL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "timer" INTEGER,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "ratingMin" INTEGER,
    "ratingMax" INTEGER,
    "ratingLabelMin" TEXT,
    "ratingLabelMax" TEXT,
    "quizId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "SessionType" NOT NULL DEFAULT 'QUIZ',
    "status" "SessionStatus" NOT NULL DEFAULT 'LOBBY',
    "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "moderationMode" BOOLEAN NOT NULL DEFAULT false,
    "qaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "qaTitle" TEXT,
    "qaModerationMode" BOOLEAN NOT NULL DEFAULT true,
    "quickFeedbackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "currentQuestion" INTEGER,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "quizId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "legalHoldUntil" TIMESTAMP(3),
    "legalHoldReason" TEXT,
    "legalHoldSetAt" TIMESTAMP(3),
    "answerDisplayOrder" JSONB,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "teamId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "freeText" TEXT,
    "ratingValue" INTEGER,
    "responseTimeMs" INTEGER,
    "score" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "streakBonus" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "round" INTEGER NOT NULL DEFAULT 1,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteAnswer" (
    "id" TEXT NOT NULL,
    "voteId" TEXT NOT NULL,
    "answerOptionId" TEXT NOT NULL,

    CONSTRAINT "VoteAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "quizName" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "questionQualityRating" INTEGER,
    "wouldRepeat" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QaQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "status" "QaQuestionStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QaQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QaUpvote" (
    "id" TEXT NOT NULL,
    "qaQuestionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "direction" "QaVoteDirection" NOT NULL DEFAULT 'UP',

    CONSTRAINT "QaUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateIndex
CREATE INDEX "Question_quizId_order_idx" ON "Question"("quizId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Session_code_key" ON "Session"("code");

-- CreateIndex
CREATE INDEX "Session_status_startedAt_id_idx" ON "Session"("status", "startedAt", "id");

-- CreateIndex
CREATE INDEX "Session_status_endedAt_idx" ON "Session"("status", "endedAt");

-- CreateIndex
CREATE INDEX "Session_legalHoldUntil_idx" ON "Session"("legalHoldUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_sessionId_nickname_key" ON "Participant"("sessionId", "nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Team_sessionId_name_key" ON "Team"("sessionId", "name");

-- CreateIndex
CREATE INDEX "Vote_sessionId_questionId_round_idx" ON "Vote"("sessionId", "questionId", "round");

-- CreateIndex
CREATE INDEX "Vote_participantId_votedAt_idx" ON "Vote"("participantId", "votedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_sessionId_participantId_questionId_round_key" ON "Vote"("sessionId", "participantId", "questionId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "VoteAnswer_voteId_answerOptionId_key" ON "VoteAnswer"("voteId", "answerOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "BonusToken_token_key" ON "BonusToken"("token");

-- CreateIndex
CREATE INDEX "BonusToken_generatedAt_idx" ON "BonusToken"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionFeedback_sessionId_participantId_key" ON "SessionFeedback"("sessionId", "participantId");

-- CreateIndex
CREATE INDEX "QaQuestion_sessionId_status_createdAt_idx" ON "QaQuestion"("sessionId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "QaQuestion_sessionId_participantId_idx" ON "QaQuestion"("sessionId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "QaUpvote_qaQuestionId_participantId_key" ON "QaUpvote"("qaQuestionId", "participantId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_sessionCode_createdAt_idx" ON "AdminAuditLog"("sessionCode", "createdAt");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteAnswer" ADD CONSTRAINT "VoteAnswer_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteAnswer" ADD CONSTRAINT "VoteAnswer_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "AnswerOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusToken" ADD CONSTRAINT "BonusToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusToken" ADD CONSTRAINT "BonusToken_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionFeedback" ADD CONSTRAINT "SessionFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionFeedback" ADD CONSTRAINT "SessionFeedback_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaQuestion" ADD CONSTRAINT "QaQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaQuestion" ADD CONSTRAINT "QaQuestion_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaUpvote" ADD CONSTRAINT "QaUpvote_qaQuestionId_fkey" FOREIGN KEY ("qaQuestionId") REFERENCES "QaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaUpvote" ADD CONSTRAINT "QaUpvote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
