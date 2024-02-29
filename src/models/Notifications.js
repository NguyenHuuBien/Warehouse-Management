import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    content: { type: String, required: true },
    recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }, //người nhận
    object_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }, //đối tượng được thông báo
    status: { type: String, enum: ['sent', 'read', 'unread'], default: 'unread' },
    type: { type: String, enum: ['system', 'personal'], default: 'system' },
}, { timestamps: true, versionKey: false });

const Notifications = mongoose.model("Notifications", notificationSchema);

export default Notifications;
