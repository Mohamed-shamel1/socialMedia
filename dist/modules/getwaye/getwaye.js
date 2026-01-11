"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initializeIo = exports.connectedSocket = void 0;
const socket_io_1 = require("socket.io");
const token_secuirty_1 = require("../../utils/secuirty/token.secuirty");
const chat_1 = require("../chat");
const error_response_1 = require("../../utils/response/error.response");
exports.connectedSocket = new Map();
let io = undefined;
const initializeIo = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: ["http://127.0.0.1:5500"],
        },
    });
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_secuirty_1.decodeToken)({
                authrizaition: socket.handshake?.auth.authorization || "",
                tokenType: token_secuirty_1.tokenEnum.acsses,
            });
            const userTaps = exports.connectedSocket.get(user._id.toString()) || [];
            userTaps.push(socket.id);
            exports.connectedSocket.set(user._id.toString(), userTaps);
            socket.credential = { user, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    function disconnection(socket) {
        socket.on("disconnect", () => {
            const userId = socket.credential?.user._id?.toString();
            let remainingTaps = exports.connectedSocket.get(userId)?.filter((tap) => {
                return tap !== socket.id;
            }) || [];
            if (remainingTaps.length) {
                exports.connectedSocket.set(userId, remainingTaps);
            }
            else {
                exports.connectedSocket.delete(userId);
                (0, exports.getIo)().emit("offline_user", userId);
            }
            console.log(`logOut:::`, socket.id);
            console.log({ after_Disconnect: exports.connectedSocket });
        });
    }
    const chatGetWaye = new chat_1.ChatGatWaye();
    io.on("connection", (socket) => {
        chatGetWaye.register(socket, (0, exports.getIo)());
        disconnection(socket);
    });
};
exports.initializeIo = initializeIo;
const getIo = () => {
    if (!io) {
        throw new error_response_1.BadRequastExption("Fail to connect stablish server error ");
    }
    return io;
};
exports.getIo = getIo;
