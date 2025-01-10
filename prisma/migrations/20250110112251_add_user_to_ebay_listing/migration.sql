-- First add the userId column as nullable
ALTER TABLE "EbayListing" ADD COLUMN "userId" TEXT;

-- Update existing records with the default user ID
UPDATE "EbayListing" SET "userId" = 'clrtcbmwm000bf2ovj9ontzxa' WHERE "userId" IS NULL;

-- Make the column required now that all records have a value
ALTER TABLE "EbayListing" ALTER COLUMN "userId" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "EbayListing" ADD CONSTRAINT "EbayListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
