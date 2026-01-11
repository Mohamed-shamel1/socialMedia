"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepositry = void 0;
const database_repository_1 = require("./database.repository");
class TokenRepositry extends database_repository_1.DatabaseRebosatory {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.TokenRepositry = TokenRepositry;
