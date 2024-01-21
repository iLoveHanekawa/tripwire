import { PrismaClient } from '@prisma/client';
import { TripwireSeederRole, rolesAndPermissions } from '../tripwire/seed.js';

const prisma = new PrismaClient();

async function main() {
    const promises = rolesAndPermissions.map(async ({ role }: TripwireSeederRole, index: number) => {
        const { name, permissions } = role;
        const newRole = await prisma.role.create({
            data: {
                name,
                permissions: {
                    create: permissions.map((permission, index) => { return { name: permission }})
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
                }
            })
        });
        return newRole;
    });
    const addedData = await Promise.all(promises);
    console.log('Roles added: ' + JSON.stringify(addedData, null, 2));
}

main();
