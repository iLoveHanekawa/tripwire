#!/usr/bin/env node
import yargs from 'yargs';
import { normalize } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises } from 'fs';
const fileExists = async (filePath) => {
    try {
        await promises.access(filePath);
        return true;
    }
    catch (error) {
        console.log(error);
    }
};
const execPromise = promisify(exec);
const runPrismaFormat = async () => {
    try {
        const { stdout, stderr } = await execPromise('npx prisma format');
        console.log(stdout);
        console.log(stderr);
    }
    catch (error) {
        console.log('Something went wrong.', error);
    }
};
const runPrismaMigrate = async () => {
    try {
        const { stdout, stderr } = await execPromise('npx prisma migrate');
        console.log(stdout);
        console.log(stderr);
    }
    catch (error) {
        console.log('Something went wrong.', error);
    }
};
const processArgs = async () => {
    try {
        const { argv } = yargs(process.argv);
        const args = await argv;
        const schemaPath = process.cwd() + '\\prisma\\schema.prisma';
        const predicate = await fileExists(normalize(schemaPath));
        if (predicate) {
            await runPrismaFormat();
            const content = await promises.readFile(schemaPath, { encoding: 'utf8', flag: 'r' });
            console.log(content);
        }
        else {
        }
        // prismaFormat();
        // console.log({
        //     model: args.model, 
        //     other: args, 
        //     path: resolveAppRoot(),
        //     cwd: process.cwd()
        // });
    }
    catch (error) {
        console.log(error);
    }
};
await processArgs();
