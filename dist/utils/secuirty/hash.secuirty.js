"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comperHash = exports.generateHash = void 0;
const bcrypt_1 = require("bcrypt");
const generateHash = async (plaintext, saltRound = Number(process.env.SALT)) => {
    const salt = await (0, bcrypt_1.genSalt)(saltRound);
    return await (0, bcrypt_1.hash)(plaintext, salt);
};
exports.generateHash = generateHash;
const comperHash = async (plaintext, hash) => {
    return await (0, bcrypt_1.compare)(plaintext, hash);
};
exports.comperHash = comperHash;
