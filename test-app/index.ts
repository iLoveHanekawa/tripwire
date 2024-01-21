import express, { Request, Response } from 'express'

const app = express();

import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

app.get('/', async(req: Request, res: Response) => {
    res.json({
        success: true
    });
})

app.listen(3000, () => {
    console.log('server listening at http://localhost:3000');
});