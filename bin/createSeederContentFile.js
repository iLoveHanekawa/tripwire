import { promises } from 'fs';
import { normalize } from 'path';
export const createSeederContentFile = async () => {
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
    }
    catch (error) {
        console.log('Failed to create or write to tripwire seed configuration file.');
    }
};
