import { promises } from 'fs';
export const modifyPackageJson = async () => {
    try {
        console.log('Modifying package.json');
        const packageJSONLocation = process.cwd() + '\\package.json';
        const packageJSONContent = await promises.readFile(packageJSONLocation, { encoding: 'utf-8', flag: 'r' });
        const packageJSONObject = JSON.parse(packageJSONContent);
        packageJSONObject["prisma"] = {
            seed: "node prisma/tripwireSeeder.js"
        };
        const newContent = JSON.stringify(packageJSONObject);
        promises.writeFile(packageJSONLocation, newContent, { encoding: 'utf-8', flag: 'w' });
    }
    catch (error) {
        console.log('Failed to modify package JSON.', error);
    }
};
