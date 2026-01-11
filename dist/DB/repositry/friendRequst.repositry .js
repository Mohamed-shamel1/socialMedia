"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequstRepositry = void 0;
const database_repository_1 = require("./database.repository");
class FriendRequstRepositry extends database_repository_1.DatabaseRebosatory {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.FriendRequstRepositry = FriendRequstRepositry;
