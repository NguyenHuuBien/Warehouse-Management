import mongoose from "mongoose";
import { ROLES, SEX } from "../config/constant.js";

const employeeSchema = new mongoose.Schema({
    username: { type: String, unique: true, index: true },
    password: { type: String },
    name: { type: String },
    name_search: { type: String },
    code: { type: String },
    status: { type: Number, default: 1 },
    email: { type: String, index: true, default: '' },
    phone: { type: String },
    identify_number: { type: String },
    birthday: { type: String, },
    sex: { type: String, enum: SEX },
    roles: { type: String, enum: ROLES, default: 'employee' },
    address: { type: String, default: '' },
    position: { type: String },
    img: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    // disable_util: {
    //     type: String
    // },
    // device_tokens: [{
    //     token: { type: String },
    //     device_type: { type: String },
    //     device_id: { type: String },
    //     device_os: { type: String },
    //     last_login: { type: Date, default: Date.now },
    // }],
    // login_fail_num: {
    //     type: Number,
    //     default: 0
    // }
}, {timestamps: true, versionKey: false})

const Employee = mongoose.model("Employee", employeeSchema)
export default Employee