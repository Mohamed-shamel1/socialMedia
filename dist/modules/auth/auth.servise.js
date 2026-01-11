"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_models_1 = require("../../DB/model/user.models");
const user_repository_1 = require("../../DB/repositry/user.repository");
const error_response_1 = require("../../utils/response/error.response");
const hash_secuirty_1 = require("../../utils/secuirty/hash.secuirty");
const email_event_1 = require("../../utils/event/email.event");
const otp_1 = require("../../utils/otp");
const token_secuirty_1 = require("../../utils/secuirty/token.secuirty");
const google_auth_library_1 = require("google-auth-library");
class AuthintctionService {
    userModel = new user_repository_1.UserRepostoriy(user_models_1.UserModel);
    constructor() { }
    async viryfyGmailAcount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new error_response_1.BadRequastExption("Fail to viryfy the google acount");
        }
        return payload;
    }
    loginWithGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email } = await this.viryfyGmailAcount(idToken);
        const user = await this.userModel.findOne({ filter: { email, provider: user_models_1.ProviderEnum.GOOGLE } });
        if (!user) {
            throw new error_response_1.NotFoundExption("Email Not Exist or account rejester in another provider");
        }
        const credeanteal = await (0, token_secuirty_1.createLoginCredaintal)(user);
        return res.status(201).json({ message: "Done", data: { credeanteal } });
    };
    singupWithGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email, family_name, given_name, picture } = await this.viryfyGmailAcount(idToken);
        const user = await this.userModel.findOne({ filter: { email } });
        if (user) {
            if (user.provider === user_models_1.ProviderEnum.GOOGLE) {
                return await this.loginWithGmail(req, res);
            }
            throw new error_response_1.ConfligtExptions(`Email exsist with another account ::: ${user.provider}`);
        }
        const [newUser] = (await this.userModel.create({
            data: [{ firstName: given_name,
                    lastName: family_name,
                    email: email,
                    profileImage: picture,
                    provider: user_models_1.ProviderEnum.GOOGLE,
                    confirmetAt: new Date() }]
        })) || [];
        if (!newUser) {
            throw new error_response_1.BadRequastExption("Fail to signup with gmail please try agin ");
        }
        const credeanteal = await (0, token_secuirty_1.createLoginCredaintal)(newUser);
        return res.status(201).json({ message: "Done", data: { credeanteal } });
    };
    signup = async (req, res) => {
        let { userName, email, password } = req.body;
        console.log({ userName, email, password });
        const chekUserExist = await this.userModel.findOne({ filter: { email }, select: "email", options: { lean: true } });
        console.log({ chekUserExist });
        if (chekUserExist) {
            throw new error_response_1.ConfligtExptions("Email exist");
        }
        const otp = (0, otp_1.generateNumberOtp)();
        const user = await this.userModel.createUser({ data: [{ userName, email, password: await (0, hash_secuirty_1.generateHash)(password),
                    confirmEmailOtp: await (0, hash_secuirty_1.generateHash)(String(otp))
                }] });
        email_event_1.emailEvent.emit("confirmEmail", { to: email, otp: otp });
        return res.status(201).json({ message: "Done", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email, confirmEmailOtp: { $exists: true }, confirmetAt: { $exists: false }
            }
        });
        if (!user) {
            throw new error_response_1.NotFoundExption("Invailed account");
        }
        if (!(await (0, hash_secuirty_1.comperHash)(otp, user.confirmEmailOtp))) {
            throw new error_response_1.ConfligtExptions("Invailed confirmation code ");
        }
        await this.userModel.updateOne({
            filter: { email },
            update: {
                confirmetAt: new Date(),
                $unset: { confirmEmailOtp: 1 }
            }
        });
        return res.status(200).json({ message: "Done", data: req.body });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({ filter: { email, provider: user_models_1.ProviderEnum.SYSTEM } });
        if (!user) {
            throw new error_response_1.BadRequastExption("invalied login data");
        }
        if (!user.confirmetAt) {
            throw new error_response_1.BadRequastExption("verifiy your account first");
        }
        if (!await (0, hash_secuirty_1.comperHash)(password, user.password)) {
            throw new error_response_1.BadRequastExption("invailed login data");
        }
        const credential = await (0, token_secuirty_1.createLoginCredaintal)(user);
        return res.status(200).json({ message: "Done", data: { credential } });
    };
    sendForgetcode = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findOne({ filter: {
                email,
                provider: user_models_1.ProviderEnum.SYSTEM,
                confirmetAt: { $exists: true }
            } });
        if (!user) {
            throw new error_response_1.BadRequastExption("invalied account ");
        }
        const otp = (0, otp_1.generateNumberOtp)();
        const result = await this.userModel.updateOne({ filter: { email },
            update: {
                resertPassword: await (0, hash_secuirty_1.generateHash)(String(otp))
            }
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequastExption("fail to send the reset please try agine ");
        }
        email_event_1.emailEvent.emit("resetPassword", { to: email, otp });
        return res.status(200).json({ message: "Done" });
    };
    resetForgotPassword = async (req, res) => {
        const { email, otp, password } = req.body;
        const user = await this.userModel.findOne({ filter: {
                email,
                provider: user_models_1.ProviderEnum.SYSTEM,
                resertPassword: { $exists: true }
            } });
        if (!user) {
            throw new error_response_1.BadRequastExption("invalied account or missing Password Otp ");
        }
        if (!(await (0, hash_secuirty_1.comperHash)(otp, user.resertPassword))) {
            throw new error_response_1.ConfligtExptions("invailed Otp ");
        }
        const result = await this.userModel.updateOne({ filter: { email },
            update: {
                password: await (0, hash_secuirty_1.generateHash)(password),
                chengeCredantialTime: new Date(),
                $unset: { resertPassword: 1 }
            }
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequastExption("fail to reset account password ");
        }
        return res.status(200).json({ message: "Done" });
    };
    verifyForgotPassword = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({ filter: {
                email,
                provider: user_models_1.ProviderEnum.SYSTEM,
                resertPassword: { $exists: true }
            } });
        if (!user) {
            throw new error_response_1.BadRequastExption("invalied account or missing Password Otp ");
        }
        if (!(await (0, hash_secuirty_1.comperHash)(otp, user.resertPassword))) {
            throw new error_response_1.ConfligtExptions("invailed Otp ");
        }
        return res.status(200).json({ message: "Done" });
    };
}
exports.default = new AuthintctionService;
