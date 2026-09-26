-- Add createdAt to Question model
ALTER TABLE "Question" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;