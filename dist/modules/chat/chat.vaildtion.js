"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatingGroup = exports.getChatingGroup = exports.getChat = void 0;
const zod_1 = __importStar(require("zod"));
const validation_midelware_1 = require("../../midelware/validation.midelware");
exports.getChat = {
    params: zod_1.default.strictObject({
        userId: validation_midelware_1.genralField.id
    }),
    query: zod_1.default.strictObject({
        page: zod_1.coerce.number().int().min(1).optional(),
        size: zod_1.coerce.number().int().min(1).optional()
    })
};
exports.getChatingGroup = {
    params: zod_1.default.strictObject({
        groupId: validation_midelware_1.genralField.id
    }),
    query: exports.getChat.query
};
exports.createChatingGroup = {
    body: zod_1.default.strictObject({
        participants: zod_1.default.array(validation_midelware_1.genralField.id).min(1),
        group: zod_1.default.string().min(2).max(5000)
    }).superRefine((data, ctx) => {
        if (data.participants?.length && data.participants?.length !== [...new Set(data.participants)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["participants"],
                message: "Duplaceted taged user"
            });
        }
    })
};
