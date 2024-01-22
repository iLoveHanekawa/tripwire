/*
  Warnings:

  - You are about to drop the `ModelHasPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModelHasRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleHasPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ModelHasPermission" DROP CONSTRAINT "ModelHasPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "ModelHasRoles" DROP CONSTRAINT "ModelHasRoles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleHasPermission" DROP CONSTRAINT "RoleHasPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RoleHasPermission" DROP CONSTRAINT "RoleHasPermission_roleId_fkey";

-- DropTable
DROP TABLE "ModelHasPermission";

-- DropTable
DROP TABLE "ModelHasRoles";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RoleHasPermission";
