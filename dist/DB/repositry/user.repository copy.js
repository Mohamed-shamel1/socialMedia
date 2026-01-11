"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepostoriy = void 0;
const database_repository_1 = require("./database.repository");
const error_response_1 = require("../../utils/response/error.response");
class UserRepostoriy extends database_repository_1.DatabaseRebosatory {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data, options, }) {
        const [user] = (await this.create({ data })) || [];
        if (!user) {
            throw new error_response_1.BadRequastExption("Fail to create this user");
        }
        return user;
    }
}
exports.UserRepostoriy = UserRepostoriy;
