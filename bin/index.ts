#!/usr/bin/env node
import yargs, { Argv } from 'yargs';
import { normalize } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises } from 'fs';
import { EOL } from 'os';

const createSeederFile = async() => {
    try {
        console.log('Creating seed file.');
        const seederFilePath = process.cwd() + '\\prisma\\tripwireSeeder.js';
        const seederContent = `"use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        const client_1 = require("@prisma/client");
        const seed_1 = require("../tripwire/seed");
        const prisma = new client_1.PrismaClient();
        async function main() {
            const promises = seed_1.rolesAndPermissions.map(async ({ role }, index) => {
                const { name, permissions } = role;
                const newRole = await prisma.role.create({
                    data: {
                        name,
                        permissions: {
                            create: permissions.map((permission, index) => { return { name: permission }; })
                        }
                    },
                    include: {
                        permissions: true
                    }
                });
                await prisma.roleHasPermission.createMany({
                    data: newRole.permissions.map((permission) => {
                        return {
                            roleId: newRole.id,
                            permissionId: permission.id
                        };
                    })
                });
                return newRole;
            });
            const addedData = await Promise.all(promises);
            console.log('Roles added: ' + JSON.stringify(addedData, null, 2));
        }
        main();
        `;
        await promises.writeFile(normalize(seederFilePath), seederContent, { encoding: "utf-8", flag: 'a+' });
    } catch (error) {
        console.log('Failed to create or write to tripwire seed file.');
    }
}

const createSeederContentFile = async () => {
    try {
        console.log('Creating seeder configuration file.');
        const seederContentFilePath = process.cwd() + '\\tripwire\\seed.js';
        promises.mkdir(normalize(process.cwd() + '\\tripwire'));
        const seederFileContent = `"use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.rolesAndPermissions = void 0;
        exports.rolesAndPermissions = [
            {
                role: {
                    name: 'example_role',
                    permissions: ['example_permission_A', 'example_permission_B']
                }
            }
        ];
        `;
        promises.writeFile(normalize(seederContentFilePath), seederFileContent, { encoding: 'utf-8', flag: 'a+' });
    } catch (error) {
        console.log('Failed to create or write to tripwire seed configuration file.')
    }
    
}

const modifyPackageJson = async() => {
    try {
        console.log('Modifying package.json');
        const packageJSONLocation = process.cwd() + '\\package.json';
    
        const packageJSONContent = await promises.readFile(packageJSONLocation, { encoding: 'utf-8', flag: 'r' });
        const packageJSONObject: { [key: string]: { seed: string, [key: string]: string } } = JSON.parse(packageJSONContent);
        packageJSONObject["prisma"] = {
            seed: "node prisma/tripwireSeeder.js"
        }
        const newContent = JSON.stringify(packageJSONObject);
        promises.writeFile(packageJSONLocation, newContent, { encoding: 'utf-8', flag: 'w' });
    } catch (error) {
        console.log('Failed to modify package JSON.', error);
    }
}

const runPrismaDatabaseSeed = async() => {
    try {
        console.log('Seeding the database with tripwire.');
        const { stdout, stderr } = await execPromise('npx prisma db seed');
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.log('Something went wrong.', error)        
    }
}

const addRolesAndPermissionsToSchema = async (model: string) => {
    let unProcessedString = `
    model Role {
        id          Int      @id @default(autoincrement())
        name        String   @unique
        createdAt   DateTime @default(now())
        updatedAt   DateTime @updatedAt
        ${model}s       ${model}[]   // Many-to-many relationship with ${model}
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
}

const fileExists = async (filePath: string) => {
    try {
        await promises.access(filePath);
        return true;
    } catch (error) {
        console.log(error);
    }
}

const execPromise = promisify(exec);

const runPrismaFormat = async() => {
    try {
        const { stdout, stderr } = await execPromise('npx prisma format');
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.log('Something went wrong.', error)        
    }
}

const runPrismaMigrate = async(model: string) => {
    try {
        const { stdout, stderr } = await execPromise(`npx prisma migrate dev --name added-roles-and-permissions-for-${model}`);
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.log('Something went wrong.', error);        
    }
}

const getLineArr = async (content: string) => {
    // Investigate: Don't need to use EOL?
    return content.split('\n');
}

const modelExists = async (lineArr: string[], modelName: string): Promise<boolean> => {
    let modelFound = false;
    lineArr.forEach((value, index) => {
        if(value === `model ${modelName} {`) {
            modelFound = true;
        }
    });
    return modelFound;
}

const processArgs = async () => {
    try {
        const { argv } = yargs(process.argv) as Argv<{ model: string }>;
        const args = await argv;
        const schemaPath = process.cwd() + '\\prisma\\schema.prisma';
        const predicate = await fileExists(normalize(schemaPath));
        if(predicate) {
            await runPrismaFormat();
            const content = await promises.readFile(schemaPath, { encoding: 'utf8', flag: 'r'});
            const lineArr = await getLineArr(content);
            const modelExistsInSchema = await modelExists(lineArr, args.model);
            if(!modelExistsInSchema) {
                console.log('No matching model found.');
                return;
            }
            const newContent = await addRolesAndPermissionsToSchema(args.model);
            promises.writeFile(normalize(schemaPath), newContent, { encoding: 'utf-8', flag: 'a+' });
            await runPrismaFormat();
            await runPrismaMigrate(args.model);
            await createSeederContentFile();
            await createSeederFile();
            await modifyPackageJson();
            await runPrismaDatabaseSeed();
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
    } catch (error) {
        console.log(error);
    }
}

await processArgs();
