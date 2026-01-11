"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.ProviderEnum = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
    RoleEnum["superAdmin"] = "super-admin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var ProviderEnum;
(function (ProviderEnum) {
    ProviderEnum["GOOGLE"] = "GOOGLE";
    ProviderEnum["SYSTEM"] = "SYSTEM";
})(ProviderEnum || (exports.ProviderEnum = ProviderEnum = {}));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minLength: 2, maxlength: 25 },
    lastName: { type: String, required: true, minLength: 2, maxlength: 25 },
    slug: { type: String, required: true, minLength: 5, maxlength: 52 },
    extra: {
        name: String
    },
    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmetAt: { Date },
    password: { type: String, required: function () {
            return this.provider === ProviderEnum.GOOGLE ? false : true;
        } },
    resertPassword: { type: String },
    chengeCredantialTime: { type: Date },
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String },
    coverImages: [String],
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    provider: { type: String, enum: ProviderEnum, default: ProviderEnum.SYSTEM },
    freezedAt: Date,
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    frindes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
}).get(function () {
    return this.firstName + " " + this.lastName;
});
userSchema.pre(["find", "findOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
