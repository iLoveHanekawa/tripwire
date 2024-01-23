import { EOL } from 'os';
export const addRolesAndPermissionsToSchema = async (model) => {
    let unProcessedString = `
    model Role {
      id BigInt @id @default(autoincrement())
      name String @db.VarChar(255) @unique
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      models ModelHasRoles[]
      permissions RoleHasPermission[]
    }
    
    model Permission {
      id BigInt @id @default(autoincrement())
      name String @db.VarChar(255) @unique
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      models ModelHasPermission[]
      roles RoleHasPermission[]
    }
    
    model ModelHasRoles {
      modelId BigInt
      modelType String @db.VarChar(255)
      roleId BigInt
      role Role @relation(fields: [roleId], references: [id])
      @@id([roleId, modelId, modelType])
    }
    
    model ModelHasPermission {
      modelId BigInt
      modelType String @db.VarChar(255)
      permissionId BigInt
      permission Permission @relation(fields: [permissionId], references: [id])
      @@id([modelId, modelType, permissionId])
    }
    
    model RoleHasPermission {
      roleId BigInt
      permissionId BigInt
      role Role @relation(fields: [roleId], references: [id])
      permission Permission @relation(fields: [permissionId], references: [id])
      @@id([roleId, permissionId])
    }
    `;
    return unProcessedString.replace(EOL, '\n');
};
