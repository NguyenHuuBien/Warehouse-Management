import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Employee from "../models/Employee.js";
import { createValidation, loginValidation, signupValidation, updateValidations } from "../validations/EmployeeValidations.js"
import { AuthenticationError, NotFoundError, ParamError, SystemError } from '../config/errors.js';
import { uploadImage } from '../config/upload.js';
import { isObjectId } from '../validations/index.js';
import { convertCode, convertNameSearch } from '../utils/convert.js';
import { getPaginData, getPagination } from '../utils/paging.js';
import Supplier from '../models/Supplier.js';
import { query } from 'express';

export const create = async ({ body, user, file }) => {
    let validate = await createValidation.validateAsync(body)

    const oldIdentify = await Employee.findOne({ identify_number: validate.identify_number })
    if (oldIdentify) throw new ParamError("Số Căn cước này trùng với nhân viên ở trong công ty")

    const oldUsername = await Employee.findOne({ username: validate.username })
    if (oldUsername) throw new ParamError("Tên tại khoản này đã tồn tại")

    validate.password = bcrypt.hashSync(validate.password, 12) //compareSync để so sánh

    const oldNumberEmployee = await Employee.countDocuments()
    validate.code = convertCode('NV', oldNumberEmployee)
    validate.name_search = convertNameSearch(validate.name)
    if (file) {
        const img = await uploadImage(file, "huyenxinhgai")
        validate.img = img
    }
    const result = await new Employee(validate).save()
    return result
}
export const update = async ({ body, user, params, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateValidations.validateAsync(body)

    const oldUser = await Employee.findById(id).lean()
    if (!oldUser) throw new NotFoundError("Người dùng không tồn tại!")

    if (validate.username && validate.username != oldUser.username) {
        const oldUsername = await Employee.findOne({ username: validate.username })
        if (oldUsername) throw new Error("Tên tài khoàn này đã tồn tại!")
    }

    if (validate.password) validate.password = bcrypt.hashSync(validate.password, 12)
    if (file) {
        const img = await uploadImage(file)
        validate.img = img
    }
    const result = await Employee.findByIdAndUpdate(id, validate)
    return true

}

export const get = async ({params}) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldUser = await Employee.findById(id).lean()
        .select("-createdAt -updatedAt -username -password -name_search -status")
        .lean()
    return oldUser
}
export const list = async ({ query: { q = '', status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    if (q) conditions = searchNameCode(q)
    if (status) conditions.status = status
    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse

    conditions.company = currentUser.company

    const { offset } = getPagination(page, limit)
    const result = await Employee.find(conditions)
        .select("-createdAt -updatedAt -username -password -name_search -status")
        .limit(limit)
        .skip(offset)
        .sort({ createdAt: -1 })
        .lean()
    const total = await Employee.countDocuments(conditions)
    return getPaginData(result, total, page)
}

export const verifyToken = (rolesCheck = []) => {
    return async (req, res, next) => {
        const { authorization } = req.headers
        if (!authorization) next(new AuthenticationError("Bạn chưa đăng nhập!"))
        const accessToken = authorization.replace("Bearer ", "")

        try {
            const info = jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, payload) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        // Xử lý trường hợp token đã hết hạn
                        return next(new Error('Bạn chưa đăng nhập!'));
                    } else {
                        return next(err);
                    }
                } else {
                    return payload
                }
            });

            //check roles
            let { _id, name, roles, company, warehouse } = info
            req['user'] = info
            roles = [roles]
            if (!_id || !name || !roles) return next(new Error("Dữ liệu Login không đúng!"))
            const isAdmin = roles.includes("admin")
            if (isAdmin) return next()
            if (!company) return next(new Error("Bạn không phải người của công ty!")) //check xem thông tin ng login có _id company không
            if (!roles.includes("manager") && !warehouse) return next(new Error("Bạn không phải quản lý của công ty!"))
            //check xem người đăng nhập có quyền chỉnh sửa không?
            if (rolesCheck.length > 0) {
                let check = false
                for (let role of rolesCheck) {
                    if (roles.includes(role)) check = true
                    break
                }
                if (!check) return next(new Error("Bạn không có quyền chỉnh sửa!"))
            }
        } catch (error) {
            return next(new AuthenticationError("Bạn chưa đăng nhập!"))
        }

        next()
    }
}
// const refreshTokens = []

export const login = async ({ body, user }) => {
    const validate = await loginValidation.validateAsync(body)
    const oldEmployee = await Employee.findOne({ username: validate.username })
    const oldSupplier = await Supplier.findOne({ username: validate.username })
    const oldUser = oldEmployee ? oldEmployee : oldSupplier

    if (!oldUser) throw new NotFoundError("Người dùng không tồn tại!")
    if (oldUser.status == 0) throw new Error("Tài khoản này đã bị khóa!")
    const isPassword = bcrypt.compareSync(validate.password, oldUser.password)
    if (!isPassword) throw new Error("Username or Password không đúng!")

    const { _id, name, roles, company, warehouse } = oldUser;
    const accessToken = await _generateToken({ _id, name, roles, company, warehouse }, process.env.JWT_SECRET_KEY, '1d')
    // const refreshToken = await _generateToken({ _id }, process.env.JWT_SECRET_REFRESH_KEY, '30d')
    // refreshTokens.push(refreshToken)
    return { user: { _id, name, roles, company, warehouse }, accessToken }
}

// export const token = async ({ body, user }) => {
//     const { refreshToken } = body;

//     try {
//         const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_KEY);
//         const isValidRefreshToken = refreshTokens.includes(refreshToken);

//         if (!isValidRefreshToken) {
//             throw new Error("Refresh token không hợp lệ!");
//         }
//         const _id = decodedRefreshToken._id;
//         const userFromDatabase = await Employee.findById(_id);

//         if (!userFromDatabase) {
//             throw new Error("Người dùng không tồn tại!");
//         }

//         const { _id: userId, name, roles, company, warehouse } = userFromDatabase;
//         const newAccessToken = await _generateToken({ userId, name, roles, company, warehouse }, process.env.JWT_SECRET_KEY, '1d');

//         return { token: newAccessToken };
//     } catch (error) {
//         throw new Error("Token bị lỗi!");
//     }
// }

const _generateToken = async ({ _id, name, roles, company, warehouse }, key, exp) => {
    const oldEmployee = { _id, name, roles, company, warehouse }
    const token = await new Promise((resolve, reject) => {
        jwt.sign(oldEmployee, key, { expiresIn: exp }, (error, token) => {
            if (error) return reject(error)

            return resolve(token)
        })
    })
    return token
}