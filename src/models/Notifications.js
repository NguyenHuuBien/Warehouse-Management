import mongoose from "mongoose";
import { ROLES } from "../config/constant.js";

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }, //người gửi
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }, //người gửi
    status: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

const Notifications = mongoose.model("Notifications", notificationSchema);

export default Notifications;
