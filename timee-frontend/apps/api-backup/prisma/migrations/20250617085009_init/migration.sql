-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC+8',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "start_time" TEXT NOT NULL DEFAULT '09:00',
    "end_time" TEXT NOT NULL DEFAULT '17:00',
    "event_type" TEXT NOT NULL DEFAULT 'group',
    "include_time" BOOLEAN NOT NULL DEFAULT false,
    "selected_dates" TEXT,
    "finalized_slots" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "event_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "participant_name" TEXT NOT NULL,
    "participant_email" TEXT,
    "user_initials" TEXT NOT NULL,
    "paint_mode" TEXT NOT NULL DEFAULT 'available',
    "timezone" TEXT NOT NULL DEFAULT 'UTC+8',
    "available_slots" JSONB NOT NULL DEFAULT [],
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_responses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "event_responses_event_id_participant_name_key" ON "event_responses"("event_id", "participant_name");
