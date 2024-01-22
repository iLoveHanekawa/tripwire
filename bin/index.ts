#!/usr/bin/env node
import yargs, { Argv } from 'yargs';
import { normalize } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises } from 'fs';
import { EOL } from 'os';

const createExtensionFile = async() => {
    try {
        console.log('Creating extension file.');
        const extensionContentFilePath = process.cwd() + '\\tripwire\\extension.js';
        const extensionContent = `import { Prisma } from "@prisma/client";
        export const createTripwireExtension = Prisma.defineExtension((client) => {
            return client.$extends({
                model: {
                    users: {
                        async removeRole(roleName, where) {
                            const ctx = Prisma.getExtensionContext(this);
                            const prismaClient = ctx.$parent;
                            const user = await ctx.findUnique({ where });
                            const role = await prismaClient.role.findUnique({ where: { name: roleName } });
                            if (!user) {
                                console.log('User not found.');
                                return user;
                            }
                            else if (!role) {
                                console.log('Role not found.');
                                return role;
                            }
                            const predicate = await prismaClient.modelHasRoles.findUnique({ where: {
                                    roleId_modelId_modelType: {
                                        roleId: role.id,
                                        modelId: user.id,
                                        modelType: 'users'
                                    }
                                } });
                            if (!predicate) {
                                return true;
                            }
                            else {
                                await prismaClient.modelHasRoles.delete({
                                    where: {
                                        roleId_modelId_modelType: {
                                            modelId: user.id,
                                            modelType: 'users',
                                            roleId: 1
                                        }
                                    }
                                });
                                return true;
                            }
                        },
                        async assignRole(roleName, where) {
                            const ctx = Prisma.getExtensionContext(this);
                            const prismaClient = ctx.$parent;
                            const user = await ctx.findUnique({ where });
                            const role = await prismaClient.role.findUnique({ where: { name: roleName } });
                            if (!user) {
                                console.log('User not found.');
                                return user;
                            }
                            else if (!role) {
                                console.log('Role not found.');
                                return role;
                            }
                            const predicate = await prismaClient.modelHasRoles.findUnique({ where: {
                                    roleId_modelId_modelType: {
                                        roleId: role.id,
                                        modelId: user.id,
                                        modelType: 'users'
                                    }
                                } });
                            if (!predicate) {
                                await prismaClient.modelHasRoles.create({
                                    data: {
                                        modelId: user.id,
                                        modelType: 'users',
                                        roleId: role.id
                                    }
                                });
                                return true;
                            }
                            else {
                                return true;
                            }
                        },
                        async hasRole(roleName, where) {
                            const ctx = Prisma.getExtensionContext(this);
                            const prismaClient = ctx.$parent;
                            const user = await ctx.findUnique({ where });
                            const role = await prismaClient.role.findUnique({ where: { name: roleName } });
                            if (!user) {
                                console.log('User not found.');
                                return user;
                            }
                            else if (!role) {
                                console.log('Role not found.');
                                return role;
                            }
                            const entry = await prismaClient.modelHasRoles.findUnique({ where: {
                                    roleId_modelId_modelType: {
                                        roleId: role.id,
                                        modelId: user.id,
                                        modelType: 'users'
                                    }
                                } });
                            return entry !== null;
                        }
                    }
                }
            });
        });
        `;
        await promises.writeFile(normalize(extensionContentFilePath), extensionContent, { encoding: "utf-8", flag: 'a+' });
    } catch(error) {
        console.log(`Error creating or writing to file at ${normalize(process.cwd() + '\\tripwire\\extension.js')}`)
    }
}

const createSeederFile = async() => {
    try {
        console.log('Creating seed file.');
        const seederFilePath = process.cwd() + '\\prisma\\tripwireSeeder.js';
        const seederContent = `import { PrismaClient } from '@prisma/client';
        import { rolesAndPermissions } from '../tripwire/seed.js';
        const prisma = new PrismaClient();
        async function main() {
            const promises = rolesAndPermissions.map(async ({ role }, index) => {
                const { name, permissions } = role;
                const newRole = await prisma.role.create({
                    data: {
                        name,
                        permissions: {
                            create: permissions.map(permission => {
                                return {
                                    permission: {
                                        create: {
                                            name: permission
                                        }
                                    }
                                };
                            })
                        }
                    },
                    include: {
                        permissions: true
                    }
                });
                return newRole;
            });
            const addedData = await Promise.all(promises);
            console.log('Successfully seeded the database.');
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
        const seederFileContent = `export const rolesAndPermissions = [
            {
                role: {
                    name: 'admin',
                    permissions: ['mutate', 'revoke']
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
            await createExtensionFile();
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
