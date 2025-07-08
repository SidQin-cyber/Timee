-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('group', 'one-on-one');

-- CreateEnum
CREATE TYPE "PaintMode" AS ENUM ('available', 'unavailable');

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "tc_code" VARCHAR(6) NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "timezone" VARCHAR(100) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "availability" TIMESTAMPTZ(6)[],

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT 'testimonials',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "like_stats" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT 'testimonials',
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "like_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_tc_code_key" ON "events"("tc_code");

-- CreateIndex
CREATE UNIQUE INDEX "participants_event_id_name_key" ON "participants"("event_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "responses_participant_id_key" ON "responses"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_target_key" ON "likes"("user_id", "target");

-- CreateIndex
CREATE UNIQUE INDEX "like_stats_target_key" ON "like_stats"("target");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
