"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantAuthMiddleware = exports.userAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const userAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(' ')[1]; // Extract token after "Bearer "
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        //@ts-ignore
        req.id = verified.id;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
exports.userAuthMiddleware = userAuthMiddleware;
const merchantAuthMiddleware = (req, res, next) => {
    const token = req.headers["Authorization"];
    const verified = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
    if (verified) {
        //@ts-ignore
        req.id = verified.id;
        next();
    }
    else {
        return res.status(403).json({ message: "Unauthorized" });
    }
};
exports.merchantAuthMiddleware = merchantAuthMiddleware;
