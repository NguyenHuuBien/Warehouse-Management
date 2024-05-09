import bcrypt from 'bcrypt'
import { ROLES, SEX } from "../config/constant.js";
import Company from "../models/Company.js";
import Employee from "../models/Employee.js";
import Warehouse from "../models/Warehouse.js";
import { convertCode, convertNameSearch } from "./convert.js";
import Supplier from '../models/Supplier.js';
import Category from '../models/Category.js';
import Unit from '../models/Unit.js';
import Product from '../models/Product.js';

function generateRandomPhoneNumber() {
    const prefixes = ['09', '03', '07', '08', '05']; // Các đầu số cho phép
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]; // Chọn ngẫu nhiên một đầu số từ danh sách
    let phoneNumber = prefix;
    for (let i = 0; i < 8; i++) {
        phoneNumber += Math.floor(Math.random() * 10); // Tạo 8 số ngẫu nhiên (tổng cộng 10 số)
    }
    return phoneNumber;
}

export const CEW = async () => {
    // const companies = [];
    // for (let i = 1; i <= 3; i++) {
    //     companies.push(await Company.create({
    //         name: `Company ${i}`,
    //         code: convertCode("CT", i - 1),
    //         phone: `123456789${i}`,
    //         address: `Company Address ${i}`,
    //         // logo: `company${i}_logo.jpg`,
    //         status: 1
    //     }));
    //     // companies.push({
    //     //     name: `Company ${i}`,
    //     //     code: convertCode("CT", i - 1),
    //     //     phone: `123456789${i}`,
    //     //     address: `Company Address ${i}`,
    //     //     // logo: `company${i}_logo.jpg`,
    //     //     status: 1
    //     // });
    // }
    // const warehouses = [];
    // for (let i = 1; i <= 10; i++) {
    //     const name = `Warehouse ${i}`
    //     // warehouses.push({
    //     //     name: name,
    //     //     name_search: convertNameSearch(name),
    //     //     phone: `035780123${i}`,
    //     //     code: convertCode("WH", i),
    //     //     address: `Warehouse Address ${i}`,
    //     //     status: 1,
    //     //     company: companies[(i - 1) % 3]._id
    //     // });
    //     warehouses.push(await Warehouse.create({
    //         name: name,
    //         name_search: convertNameSearch(name),
    //         phone: `035780123${i}`,
    //         code: convertCode("WH", i),
    //         address: `Warehouse Address ${i}`,
    //         status: 1,
    //         company: companies[(i - 1) % 3]._id
    //     }));
    // }

    // const employees = [];
    // for (let i = 1; i <= 50; i++) {
    //     const name = `Employee ${i}`
    //     const password = bcrypt.hashSync(`password${i}`, 12)
    //     employees.push(await Employee.create({
    //         username: `employee${i}`,
    //         password: password,
    //         name: name,
    //         name_search: convertNameSearch(name),
    //         code: convertCode("NV", i),
    //         status: 1,
    //         email: `employee${i}@example.com`,
    //         phone: `035780032${i}`,
    //         identify_number: `035780032${i}`,
    //         birthday: '1990-01-01',
    //         sex: SEX[Math.floor(Math.random() * SEX.length)],
    //         roles: ROLES[Math.floor(Math.random() * ROLES.length)],
    //         address: `Employee Address ${i}`,
    //         position: 'Employee Position',
    //         // img: `employee${i}.jpg`,
    //         company: companies[(i - 1) % 3]._id,
    //         warehouse: warehouses[(i - 1) % 10]._id
    //     }));
    //     // employees.push({
    //     //     username: `employee${i}`,
    //     //     password: password,
    //     //     name: name,
    //     //     name_search: convertNameSearch(name),
    //     //     code: convertCode("NV", i),
    //     //     status: 1,
    //     //     email: `employee${i}@example.com`,
    //     //     phone: `035780032${i}`,
    //     //     identify_number: `035780032${i}`,
    //     //     birthday: '1990-01-01',
    //     //     sex: SEX[Math.floor(Math.random() * SEX.length)],
    //     //     roles: ROLES[Math.floor(Math.random() * ROLES.length)],
    //     //     address: `Employee Address ${i}`,
    //     //     position: 'Employee Position',
    //     //     // img: `employee${i}.jpg`,
    //     //     company: companies[(i - 1) % 3]._id,
    //     //     warehouse: warehouses[(i - 1) % 10]._id
    //     // });
    // }

    // const companies = await Company.find();

    // const suppliers = [];
    // for (let i = 1; i <= 10; i++) {
    //     const randomCompanyIndex = Math.floor(Math.random() * companies.length);
    //     const name = `Supplier ${i}`
    //     const password = bcrypt.hashSync(`password${i}`, 12)
    //     suppliers.push({
    //         name: name,
    //         name_search: convertNameSearch(name),
    //         username: `supplier${i}`,
    //         password: password,
    //         phone: `035789876${i}`,
    //         code: convertCode("NCC", i),
    //         status: 1,
    //         email: `supplier${i}@example.com`,
    //         address: `Supplier Address ${i}`,
    //         tax_code: `Tax Code ${i}`,
    //         roles: 'supplier',
    //         company: companies[randomCompanyIndex]._id
    //     });
    // }

    // // Tạo nhà cung cấp trong cơ sở dữ liệu
    // await Supplier.create(suppliers);
    // const categories = []
    // for (const company of companies) {
    //     for (let i = 1; i <= 10; i++) {
    //         const name = `Category ${i}`
    //         const category = {
    //             name: name,
    //             name_search: convertNameSearch(name),
    //             status: 1,
    //             company: company._id
    //         };

    //         categories.push(category);
    //     }
    // }


    // // Tạo danh mục trong cơ sở dữ liệu
    // await Category.create(categories);

    // const units = []
    // for (const company of companies) {
    //     for (let i = 1; i <= 10; i++) {
    //         const name = `Unit ${i}`
    //         const unit = {
    //             name: name,
    //             name_search: convertNameSearch(name),
    //             status: 1,
    //             company: company._id
    //         };

    //         units.push(unit);
    //     }
    // }
    // await Unit.create(units);


    // const products = [];

    // const warehouses = await Warehouse.find();

    // // Lặp qua từng kho và tạo 20 sản phẩm cho mỗi kho
    // for (const warehouse of warehouses) {
    //     const createBy = await Employee.find({ warehouse: warehouse })
    //     const category = await Category.find()
    //     const unit = await Unit.find()
    //     const supplier = await Supplier.find()
    //     for (let i = 0; i < 20; i++) {
    //         // const total = await Product.countDocuments()
    //         const name = `Product ${i} for Warehouse ${warehouse.name}`
    //         const product = {
    //             name: name,
    //             name_search: convertNameSearch(name),
    //             sku: convertCode("SP", (i * 10 + i)),
    //             description: `Description for Product ${i} for Warehouse ${warehouse.name}`,
    //             unit: unit[Math.floor(Math.random() * unit.length)]._id, // Thay thế 'your_unit_id' bằng ID của đơn vị tính mong muốn
    //             price_import: Math.floor(Math.random() * 1000) + 1,
    //             price: Math.floor(Math.random() * 2000) + 1,
    //             number: Math.floor(Math.random() * 100) + 1,
    //             position: `Position ${i}`,
    //             size: {
    //                 length: Math.floor(Math.random() * 100) + 1,
    //                 width: Math.floor(Math.random() * 100) + 1,
    //                 height: Math.floor(Math.random() * 100) + 1,
    //             },
    //             weight: Math.floor(Math.random() * 100) + 1,
    //             color: `Color ${i}`,
    //             status: 1,
    //             img: '',
    //             category: category[Math.floor(Math.random() * category.length)]._id,
    //             created_by: createBy[Math.floor(Math.random() * createBy.length)]._id,
    //             supplier: supplier[Math.floor(Math.random() * supplier.length)]._id,
    //             warehouse: warehouse._id
    //         };

    //         products.push(product);
    //     }
    // }

    // // Tạo 20 sản phẩm cho kho được chỉ định


    // // Tạo sản phẩm trong cơ sở dữ liệu
    // await Product.create(products);

    // const warehouses = await Warehouse.find()
    // await Promise.all(warehouses.map(async warehouse => {
    //     await Warehouse.findByIdAndUpdate(warehouse._id, { phone: generateRandomPhoneNumber() })
    // }))
    // const supplies = await Supplier.find()
    // await Promise.all(supplies.map(async supply => {
    //     await Supplier.findByIdAndUpdate(supply._id, { phone: generateRandomPhoneNumber() })
    // }))
    // const employees = await Employee.find()
    // await Promise.all(employees.map(async employee => {
    //     await Employee.findByIdAndUpdate(employee._id, { phone: generateRandomPhoneNumber(), identify_number: generateRandomNumberString() })
    // }))
    // const companies = await Company.find()
    // await Promise.all(companies.map(async company => {
    //     await Company.findByIdAndUpdate(company._id, { phone: generateRandomPhoneNumber() })
    // }))

    
    return warehouses
}

function generateRandomNumberString() {
    const randomNumberString = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    return randomNumberString;
}