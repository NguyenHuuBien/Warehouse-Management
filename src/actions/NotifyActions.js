import { ParamError } from "../config/errors.js";
import Notifications from "../models/Notifications.js";

export const update = ({ body, user }) => { //đầu vào là 1 list các notification có status = 0
    const notifications = JSON.parse(body.notify)
    notifications.forEach(async notify => {
        const oldNotify = await Notifications.findById(notify._id)
        if (oldNotify.receiver == user._id) {
            await oldNotify.updateOne({ status: 1 })
        } else {
            throw new ParamError("Thông báo này không phải của người dùng!")
        }
    });
    return true
}

export const list = async ({ query: { }, user }) => {
    const listNotify = await Notifications.find({ receiver: user._id })
        .sort({ createdAt: -1 })
    return listNotify
}