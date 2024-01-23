import { promises } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromise = promisify(exec);

export const runPrismaFormat = async() => {
    try {
        const { stdout, stderr } = await execPromise('npx prisma format');
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.log('Something went wrong.', error)        
    }
}

export const runPrismaMigrate = async(model: string) => {
    try {
        const { stdout, stderr } = await execPromise(`npx prisma migrate dev --name added-roles-and-permissions-for-${model}`);
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.log('Something went wrong.', error);        
    }
}

export const runPrismaDatabaseSeed = async() => {
    try {
        console.log('Seeding the database with tripwire.');
        const { stdout, stderr } = await execPromise('npx prisma db seed');
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.log('Something went wrong.', error)        
    }
}
