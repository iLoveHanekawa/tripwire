import { Prisma } from "@prisma/client";
export const tripwireExtension = Prisma.defineExtension((client) => {
    return client.$extends({
        model: {
            users: {
                async hasRole(role, where) {
                    const context = Prisma.getExtensionContext(this);
                    where.Role = {
                        name: role
                    };
                    const user = await context.findFirst({ where });
                    if (user)
                        return true;
                    else
                        return false;
                },
                async addRole(role, where) {
                    const context = Prisma.getExtensionContext(this);
                }
            }
        }
    });
});
