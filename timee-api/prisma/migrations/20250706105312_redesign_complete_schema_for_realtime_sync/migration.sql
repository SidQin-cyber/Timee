/*
  Warnings:

  - You are about to alter the column `title` on the `events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `like_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `like_stats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `target` on the `like_stats` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `likes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `user_id` on the `likes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `target` on the `likes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `end_date` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initials` to the `participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `responses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `availability` on the `responses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SyncAction" AS ENUM ('create', 'update', 'delete', 'join', 'leave');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "description" TEXT,
ADD COLUMN     "end_date" DATE NOT NULL,
ADD COLUMN     "end_time" VARCHAR(8),
ADD COLUMN     "event_type" VARCHAR(20) NOT NULL DEFAULT 'group',
ADD COLUMN     "include_time" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_date" DATE NOT NULL,
ADD COLUMN     "start_time" VARCHAR(8),
ADD COLUMN     "timezone" VARCHAR(100) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "like_stats" DROP CONSTRAINT "like_stats_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "target" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "like_stats_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "likes" DROP CONSTRAINT "likes_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "target" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "initials" VARCHAR(10) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "responses" ADD COLUMN     "paint_mode" "PaintMode" NOT NULL DEFAULT 'available',
ADD COLUMN     "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "availability",
ADD COLUMN     "availability" JSONB NOT NULL;

-- DropEnum
DROP TYPE "EventType";

-- CreateTable
CREATE TABLE "participant_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "participant_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "participant_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_sync_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "action_type" "SyncAction" NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "triggered_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heatmap_cache" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "date_index" INTEGER NOT NULL,
    "time_index" INTEGER NOT NULL,
    "participant_count" INTEGER NOT NULL,
    "participant_names" TEXT[],
    "last_updated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heatmap_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participant_sessions_participant_id_session_id_key" ON "participant_sessions"("participant_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "heatmap_cache_event_id_date_index_time_index_key" ON "heatmap_cache"("event_id", "date_index", "time_index");

-- AddForeignKey
ALTER TABLE "participant_sessions" ADD CONSTRAINT "participant_sessions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_sessions" ADD CONSTRAINT "participant_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
