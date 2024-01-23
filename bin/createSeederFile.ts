import { normalize } from 'path';
import { promises } from 'fs';

export const createSeederFile = async() => {
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