"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)("./config/.env.development") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const modules_1 = require("./modules");
const conection_db_1 = __importDefault(require("./DB/conection.db"));
const error_response_1 = require("./utils/response/error.response");
const chat_1 = require("./modules/chat");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 5000;
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, helmet_1.default)());
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 60 * 60000,
        limit: 2000,
        message: { error: "Too mny requst please try again" },
        statusCode: 429,
    });
    app.use(limiter);
    app.get("/", (req, res) => {
        res.json(`welcome in ${process.env.APPLICATION_NAME} in lainding page ❤️😍`);
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.userRouter);
    app.use("/post", modules_1.postRouter);
    app.use("/chat", chat_1.chatRouter);
    app.use("{/*dummy}", (req, res) => {
        return res
            .status(409)
            .json({ message: "invalide app routing plz cheak methode or url ❌" });
    });
    app.use(error_response_1.glopelErrorHandleing);
    await (0, conection_db_1.default)();
    const httpServer = app.listen(port, () => {
        console.log(`Server is ruining on port::: ${port} ❤️`);
    });
    (0, modules_1.initializeIo)(httpServer);
};
exports.default = bootstrap;
