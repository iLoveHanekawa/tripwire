export type TripwireSeederRole = { role: { name: string, permissions: string[] }}

export const rolesAndPermissions: TripwireSeederRole[] = [
    {
        role: {
            name: 'example_role',
            permissions: ['example_permission_A', 'example_permission_B']
        }
    }
];
