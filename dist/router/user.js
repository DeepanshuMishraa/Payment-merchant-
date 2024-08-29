"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const config_1 = require("../config");
const middleware_1 = require("../middleware");
const db_1 = __importDefault(require("../utils/db"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username, password } = req.body;
        // Validate the request body
        if (!name || !username || !password) {
            return res.status(400).json({ message: "Invalid request body" });
        }
        yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield tx.user.create({
                data: {
                    name,
                    username,
                    password,
                }
            });
            yield tx.userAccount.create({
                data: {
                    userId: user.id
                }
            });
        }));
        return res.status(200).json({ message: "User created successfully" });
    }
    catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Invalid request body" });
        }
        const user = yield db_1.default.user.findFirst({
            where: {
                username,
                password
            }
        });
        if (!user) {
            return res.status(403).json({ message: "Unable to find your account" });
        }
        if (password !== user.password) {
            return res.status(403).json({ message: "Invalid Password" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
        }, config_1.JWT_SECRET, { expiresIn: '1h' }); // Add an expiration time
        return res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.userRouter.post("/transfer/merchant", middleware_1.userAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, mechantId } = req.body;
        if (!amount || !mechantId) {
            return res.status(400).json({ message: "Invalid request body" });
            // decremenet the user balance
        }
    }
    catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.userRouter.post("/onramp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = req.body;
    const account = yield db_1.default.userAccount.update({
        where: {
            userId: userId
        },
        data: {
            balance: {
                increment: amount
            }
        }
    });
    return res.status(200).json({ message: "Onramp successful", data: account });
}));
exports.userRouter.post("/transfer", middleware_1.userAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { merchantId, amount } = req.body;
    //@ts-ignore
    const userId = req.id;
    // very safe basically not double spending
    const paymentDone = yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const userAccount = yield tx.userAccount.findFirst({
            where: {
                userId: userId
            }
        });
        if (((userAccount === null || userAccount === void 0 ? void 0 : userAccount.balance) || 0) < amount) {
            return false;
        }
        yield tx.userAccount.update({
            where: {
                userId: userId
            },
            data: {
                balance: {
                    decrement: amount
                }
            }
        });
        yield tx.merchantAccount.update({
            where: {
                merchantId
            },
            data: {
                balance: {
                    increment: amount
                }
            }
        });
        return true;
    }));
    if (paymentDone) {
        return res.status(200).json({ message: "Payment successful" });
    }
    return res.status(403).json({ message: "Insufficient balance" });
}));
