"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRebosatory = void 0;
const error_response_1 = require("../../utils/response/error.response");
class DatabaseRebosatory {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async createUser({ data, options, }) {
        const [user] = (await this.create({ data })) || [];
        if (!user) {
            throw new error_response_1.BadRequastExption("Fail to create this user");
        }
        return user;
    }
}
exports.DatabaseRebosatory = DatabaseRebosatory;
