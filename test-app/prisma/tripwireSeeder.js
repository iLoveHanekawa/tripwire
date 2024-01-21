"use strict";
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
        return newRole;
    });
    const addedData = await Promise.all(promises);
    console.log('Roles added: ' + JSON.stringify(addedData, null, 2));
}
main();
