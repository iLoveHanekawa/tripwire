import express from 'express';
const app = express();
import { PrismaClient } from '@prisma/client';
import { tripwireExtension } from './tripwire/extension.js';
const prismaClient = new PrismaClient().$extends(tripwireExtension);
const user = await prismaClient.users.findFirst({
    where: {
        Role: {
            id: 0
        }
    },
});
app.get('/', async (req, res) => {
    res.json({
        success: true
    });
});
app.listen(3000, () => {
    console.log('server listening at http://localhost:3000');
});
