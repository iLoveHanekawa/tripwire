#!/usr/bin/env node
import yargs, { Arguments, Argv } from 'yargs';
import { hideBin } from 'yargs/helpers'
import { normalize } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises } from 'fs';
import { EOL } from 'os';
import { createExtensionFile } from './createExtensionFile.js';
import { createSeederFile } from './createSeederFile.js';
import { createSeederContentFile } from './createSeederContentFile.js';
import { modifyPackageJson } from './modifyPackageJson.js';
import { addRolesAndPermissionsToSchema } from './addRolesAndPermissionsToSchema.js';
import { runPrismaDatabaseSeed, runPrismaFormat, runPrismaMigrate } from './prismaCommands.js'

const fileExists = async (filePath: string) => {
    try {
        await promises.access(filePath);
        return true;
    } catch (error) {
        console.log(error);
    }
}


const getLineArr = async (content: string) => {
    // Investigate: Don't need to use EOL?
    return content.split('\n');
}

const modelExists = async (lineArr: string[], modelName: string): Promise<boolean> => {
    let modelFound = false;
    lineArr.forEach((value, index) => {
        if(value === `model ${modelName} {`) {
            modelFound = true;
        }
    });
    return modelFound;
}

yargs(hideBin(process.argv)).command('init', 'start the server', () => {}, async (argv: Arguments<{ model?: string; typescript?: string; prefix?: string}>) => {
    const schemaPath = process.cwd() + '\\prisma\\schema.prisma';
    const predicate = await fileExists(normalize(schemaPath));
    if(predicate) {
        await runPrismaFormat();
        const content = await promises.readFile(schemaPath, { encoding: 'utf8', flag: 'r'});
        const lineArr = await getLineArr(content);
        if(argv.model) {
            const modelExistsInSchema = await modelExists(lineArr, argv.model);
            if(!modelExistsInSchema) {
                console.log('No matching model found.');
                return;
            }
            const newContent = await addRolesAndPermissionsToSchema(argv.model);
            promises.writeFile(normalize(schemaPath), newContent, { encoding: 'utf-8', flag: 'a+' });
            await runPrismaFormat();
            await runPrismaMigrate(argv.model);
            await createSeederContentFile();
            await createSeederFile();
            await createExtensionFile();
            await modifyPackageJson();
            await runPrismaDatabaseSeed();
        }
        else {
            console.log('Flag {model} was never provided.');
            return;
        }
    }
    else {
        console.log(`Prisma schema file not found. Check if ${normalize(schemaPath)} exists.`);
        return;
    }
}).parse()
