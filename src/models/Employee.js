import mongoose from "mongoose";
import { ROLES, SEX } from "../config/constant.js";

const employeeSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    name: { type: String },
    name_search: { type: String },
    code: { type: String },
    status: { type: Number, default: 1 },
    email: { type: String, default: '' },
    phone: { type: String },
    identify_number: { type: String },
    birthday: { type: String, },
    sex: { type: String, enum: SEX },
    roles: { type: String, enum: ROLES, default: 'employee' },
    address: { type: String, default: '' },
    position: { type: String },
    img: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', require: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', require: true },
}, {timestamps: true, versionKey: false})

const Employee = mongoose.model("Employee", employeeSchema)
export default Employee