/*
  Warnings:

  - You are about to drop the `ModelHasPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModelHasRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleHasPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ModelHasPermission" DROP CONSTRAINT "ModelHasPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "ModelHasRole" DROP CONSTRAINT "ModelHasRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleHasPermission" DROP CONSTRAINT "RoleHasPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RoleHasPermission" DROP CONSTRAINT "RoleHasPermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_B_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropTable
DROP TABLE "ModelHasPermission";

-- DropTable
DROP TABLE "ModelHasRole";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RoleHasPermission";

-- DropTable
DROP TABLE "_PermissionToRole";

-- DropTable
DROP TABLE "users";
