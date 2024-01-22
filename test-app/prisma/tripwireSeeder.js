import { PrismaClient } from '@prisma/client';
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
        