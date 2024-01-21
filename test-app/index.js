"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
app.get('/', async (req, res) => {
    res.json({
        success: true
    });
});
app.listen(3000, () => {
    console.log('server listening at http://localhost:3000');
});
