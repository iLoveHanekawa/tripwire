import express, { Request, Response } from 'express'

const app = express();

import { PrismaClient } from '@prisma/client';
import {createTripwireExtension} from './tripwire/extension.js';

const prismaClient = new PrismaClient().$extends(createTripwireExtension);
let user = await prismaClient.users.findUnique({ where: { id: 1 }});
if(!user) {
    user = await prismaClient.users.create({
        data: {
            age: 4,
            email: 'xyz@gmail.com',
            gpa: 0,
            name: 'arjun'
        }
    })
}
await prismaClient.users.removeRole('admin', { id: user.id });
let result = await prismaClient.users.hasRole('admin', { id: user.id });
console.log(result);
await prismaClient.users.assignRole('admin', { id: user.id });
result = await prismaClient.users.hasRole('admin', { id: user.id });
console.log(result);
