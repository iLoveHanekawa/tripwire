import { Prisma } from "@prisma/client";

export const createTripwireExtension = Prisma.defineExtension((client) => {

    return client.$extends({
        model: {
            users: {

                async removeRole<T>(this: T, roleName: string, where: Prisma.Args<T, 'findUnique'>['where']): Promise<boolean | null> {
                    const ctx = Prisma.getExtensionContext(this);
                    const prismaClient = ctx.$parent;
                    const user = await (ctx as any).findUnique({ where });
                    const role = await (prismaClient as any).role.findUnique({ where: { name: roleName } });
                    if(!user) {
                        console.log('User not found.');
                        return user;
                    }
                    else if(!role) {
                        console.log('Role not found.');
                        return role;
                    }
                    const predicate = await (prismaClient as any).modelHasRoles.findUnique({ where: {
                        roleId_modelId_modelType: {
                            roleId: role.id,
                            modelId: user.id,
                            modelType: 'users'
                        }
                    } });
                    if(!predicate) {
                        return true;
                    }
                    else {
                        await (prismaClient as any).modelHasRoles.delete({
                            where: {
                                roleId_modelId_modelType: {
                                    modelId: user.id,
                                    modelType: 'users',
                                    roleId: 1
                                }
                            }
                        })
                        return true;
                    }
                },

                async assignRole<T>(
                    this: T,
                    roleName: string,
                    where: Prisma.Args<T, 'findUnique'>['where']
                ): Promise<boolean | null> {
                    const ctx = Prisma.getExtensionContext(this);
                    const prismaClient = ctx.$parent;
                    const user = await (ctx as any).findUnique({ where });
                    const role = await (prismaClient as any).role.findUnique({ where: { name: roleName } });
                    if(!user) {
                        console.log('User not found.');
                        return user;
                    }
                    else if(!role) {
                        console.log('Role not found.');
                        return role;
                    }
                    const predicate = await (prismaClient as any).modelHasRoles.findUnique({ where: {
                        roleId_modelId_modelType: {
                            roleId: role.id,
                            modelId: user.id,
                            modelType: 'users'
                        }
                    } });
                    if(!predicate) {
                        await (prismaClient as any).modelHasRoles.create({
                            data: {
                                modelId: user.id,
                                modelType: 'users',
                                roleId: role.id
                            }
                        })
                        return true;
                    }
                    else {
                        return true;
                    }
                },

                async hasRole<T>(
                    this: T,
                    roleName: string,
                    where: Prisma.Args<T, 'findUnique'>['where']
                ): Promise<boolean | null> {
                    const ctx = Prisma.getExtensionContext(this);
                    const prismaClient = ctx.$parent;
                    const user = await (ctx as any).findUnique({ where });
                    const role = await (prismaClient as any).role.findUnique({ where: { name: roleName } })
                    if(!user) {
                        console.log('User not found.');
                        return user;
                    }
                    else if(!role) {
                        console.log('Role not found.');
                        return role;
                    }
                    const entry = await (prismaClient as any).modelHasRoles.findUnique({ where: {
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
})