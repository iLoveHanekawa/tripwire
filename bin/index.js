#!/usr/bin/env node
import yargs from 'yargs';
import { join, resolve, normalize, relative } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);
const prismaFormat = async () => {
    const { stdout, stderr } = await execPromise('npx prisma format');
    console.log(stdout);
    console.log(stderr);
};
const prismaMigrate = async () => {
    const { stdout, stderr } = await execPromise('npx prisma migrate');
    console.log(stdout);
    console.log(stderr);
};
const processArgs = async () => {
    function resolveAppRoot(fullpath, moduleSubDirectory) {
        // Normalize paths to handle different path separators
        fullpath = normalize(fullpath);
        moduleSubDirectory = normalize(moduleSubDirectory);
        // Resolve the full path and bad destination
        const resolvedFullpath = resolve(fullpath);
        const resolvedmoduleSubDirectory = resolve(moduleSubDirectory);
        // Check if the bad destination is a subdirectory of the full path
        if (resolvedmoduleSubDirectory.endsWith(resolvedFullpath)) {
            // Calculate the relative path from full path to bad destination
            const relativePath = relative(resolvedFullpath, resolvedmoduleSubDirectory);
            // Construct the resulting path by removing the relative path from the full path
            const resultingPath = join(resolvedFullpath, '..', relativePath);
            // Normalize the resulting path to handle any remaining '..' or '.' segments
            return normalize(resultingPath);
        }
        else {
            // If bad destination is not a subdirectory, return the original full path
            return resolvedFullpath;
        }
    }
    try {
        const { argv } = yargs(process.argv);
        const args = await argv;
        // prismaFormat();
        console.log({ model: args.model, other: args, path: resolveAppRoot(args._[1], args.$0) });
    }
    catch (error) {
        console.log(error);
    }
};
await processArgs();
