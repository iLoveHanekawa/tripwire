import { promises } from 'fs';
import { normalize } from 'path';

export const createExtensionFile = async() => {
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