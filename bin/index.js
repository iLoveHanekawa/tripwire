#!/usr/bin/env node
import yargs from 'yargs';
import { normalize } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises } from 'fs';
import { EOL } from 'os';
const addRolesAndPermissionsToSchema = async (model) => {
    let unProcessedString = `
    model Role {
        id          Int      @id @default(autoincrement())
        name        String   @unique
        createdAt   DateTime @default(now())
        updatedAt   DateTime @updatedAt
        ${model}s       ${model}[]   // Many-to-many relationship with users
        permissions Permission[] // Many-to-many relationship with permissions
    }
      
    model Permission {
        id          Int      @id @default(autoincrement())
        name        String   @unique
        createdAt   DateTime @default(now())
        updatedAt   DateTime @updatedAt
        roles       Role[]   // Many-to-many relationship with roles
    }

    model ModelHasRole {
        modelId Int
        roleId  Int
      
        model String // You may need to adjust this depending on your specific models
        role  Role
      
        @@id([modelId, roleId])
      }
      
      // ModelHasPermissions
      model ModelHasPermission {
        modelId      Int
        permissionId Int
      
        model      String // You may need to adjust this depending on your specific models
        permission Permission
      
        @@id([modelId, permissionId])
    }
      
    // RoleHasPermissions
    model RoleHasPermission {
        roleId       Int
        permissionId Int
      
        role      Role
        permission Permission
      
        @@id([roleId, permissionId])
    }
    `;
    return unProcessedString.replace(EOL, '\n');
};
const fileExists = async (filePath) => {
    try {
        await promises.access(filePath);
        return true;
    }
    catch (error) {
        console.log(error);
    }
};
const execPromise = promisify(exec);
const runPrismaFormat = async () => {
    try {
        const { stdout, stderr } = await execPromise('npx prisma format');
        console.log(stdout);
        console.log(stderr);
    }
    catch (error) {
        console.log('Something went wrong.', error);
    }
};
const runPrismaMigrate = async (model) => {
    try {
        const { stdout, stderr } = await execPromise(`npx prisma migrate dev --name added-roles-and-permissions-for-${model}`);
        console.log(stdout);
        console.log(stderr);
    }
    catch (error) {
        console.log('Something went wrong.', error);
    }
};
const getLineArr = async (content) => {
    // Investigate: Don't need to use EOL?
    return content.split('\n');
};
const modelExists = async (lineArr, modelName) => {
    let modelFound = false;
    lineArr.forEach((value, index) => {
        if (value === `model ${modelName} {`) {
            modelFound = true;
        }
    });
    return modelFound;
};
const processArgs = async () => {
    try {
        const { argv } = yargs(process.argv);
        const args = await argv;
        const schemaPath = process.cwd() + '\\prisma\\schema.prisma';
        const predicate = await fileExists(normalize(schemaPath));
        if (predicate) {
            // await runPrismaFormat();
            const content = await promises.readFile(schemaPath, { encoding: 'utf8', flag: 'r' });
            const lineArr = await getLineArr(content);
            const modelExistsInSchema = await modelExists(lineArr, args.model);
            if (!modelExistsInSchema) {
                console.log('No matching model found.');
                return;
            }
            const newContent = await addRolesAndPermissionsToSchema(args.model);
            promises.writeFile(normalize(schemaPath), newContent, { encoding: 'utf-8', flag: 'a+' });
            await runPrismaFormat();
        }
        else {
            console.log(`Prisma schema file not found. Check if ${normalize(schemaPath)} exists.`);
            return;
        }
        // prismaFormat();
        // console.log({
        //     model: args.model, 
        //     other: args, 
        //     path: resolveAppRoot(),
        //     cwd: process.cwd()
        // });
    }
    catch (error) {
        console.log(error);
    }
};
await processArgs();
