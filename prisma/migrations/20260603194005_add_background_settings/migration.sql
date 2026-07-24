-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "logoUrl" TEXT,
    "accent" TEXT NOT NULL DEFAULT '#6fffe9',
    "secondaryAccent" TEXT NOT NULL DEFAULT '#f8c66d',
    "theme" TEXT NOT NULL DEFAULT 'MIDNIGHT',
    "layout" TEXT NOT NULL DEFAULT 'HALO',
    "bgStyle" TEXT NOT NULL DEFAULT 'gradient',
    "bgConfig" TEXT NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Profile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("accent", "avatarUrl", "bio", "company", "coverUrl", "createdAt", "id", "layout", "location", "logoUrl", "name", "published", "secondaryAccent", "slug", "teamId", "theme", "title", "updatedAt", "userId", "website") SELECT "accent", "avatarUrl", "bio", "company", "coverUrl", "createdAt", "id", "layout", "location", "logoUrl", "name", "published", "secondaryAccent", "slug", "teamId", "theme", "title", "updatedAt", "userId", "website" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
