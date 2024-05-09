import { EXPORT_STATUS, IMPORT_STATUS, ORDER_STATUS } from "../config/constant.js";
import { ParamError } from "../config/errors.js";
import Order from "../models/Order.js"
import Product from "../models/Product.js";
import ReportProduct from "../models/ReportProduct.js";
import Warehouse from "../models/Warehouse.js";
import WareHouseExport from "../models/WarehouseExport.js";
import WarehouseImport from "../models/WarehouseImport.js";
import { getDate, lastMonth } from "../utils/convert.js";

export const reportOrder = async (year, month) => {
    let { startDate, endDate } = {}

    if (year && month) {
        ({ startDate, endDate } = getDate(year, month));
    }

    const warehouseOrder = await Order.aggregate([
        {
            $match: {
                updatedAt: { $gte: startDate, $lt: endDate }, // Lọc theo thời gian tạo
                order_status: ORDER_STATUS.RECEIVED
            }
        },
        {
            $unwind: "$products"
        },
        {
            $lookup: {
                from: "productsuppliers",
                localField: "products.product",
                foreignField: "_id",
                as: "product_supplier_details"
            }
        },
        {
            $unwind: "$product_supplier_details"
        },
        {
            $group: {
                _id: {
                    warehouse: "$warehouse",
                    product: "$products.product"
                },
                totalQuantity: { $sum: "$products.number" },
                totalPriceBeforeDiscount: { $sum: { $multiply: ["$product_supplier_details.price_import", "$products.number"] } },
                totalPriceAfterDiscount: { $sum: { $multiply: [{ $subtract: ["$product_supplier_details.price_import", { $divide: ["$discount", 100] }] }, "$products.number"] } }
            }
        },
        {
            // Lựa chọn các trường để hiển thị
            $project: {
                _id: 0,
                warehouse: "$_id.warehouse",
                product: "$_id.product",
                totalQuantity: 1,
                totalPriceBeforeDiscount: 1,
                totalPriceAfterDiscount: 1
            }
        }
    ]);

    const warehouseExport = await WareHouseExport.aggregate([
        {
            $match: {
                updatedAt: { $gte: startDate, $lt: endDate }, // Lọc theo thời gian tạo
                export_status: EXPORT_STATUS.DELIVERY
            }
        },
        {
            $unwind: "$products"
        },  
        {
            $lookup: {
                from: "products",
                localField: "products.product",
                foreignField: "_id",
                as: "product_details"
            }
        },
        {
            $unwind: "$product_details"
        },
        {
            $lookup: {
                from: "productsuppliers",
                localField: "product_details.product",
                foreignField: "_id",
                as: "product_supplier_details"
            }
        },
        {
            $unwind: "$product_supplier_details"
        },
        {
            $group: {
                _id: {
                    warehouse: "$warehouse",
                    product: "$product_supplier_details._id"
                },
                totalQuantity: { $sum: "$products.number" },
                totalPriceBeforeDiscount: { $sum: { $multiply: ["$product_details.price", "$products.number"] } },
                totalPriceAfterDiscount: { $sum: { $multiply: [{ $subtract: ["$product_details.price", { $divide: ["$discount", 100] }] }, "$products.number"] } }
            }
        },
        {
            // Lựa chọn các trường để hiển thị
            $project: {
                _id: 0,
                warehouse: "$_id.warehouse",
                product: "$_id.product",
                totalQuantity: 1,
                totalPriceBeforeDiscount: 1,
                totalPriceAfterDiscount: 1
            }
        }
    ]);

    const warehouseImport = await WarehouseImport.aggregate([
        {
            $match: {
                updatedAt: { $gte: startDate, $lt: endDate }, // Lọc theo thời gian tạo
                import_status: IMPORT_STATUS.RECEIVED
            }
        },
        {
            $lookup: {
                from: "warehouseexports",
                localField: "old_export",
                foreignField: "_id",
                as: "old_export_details"
            }
        },
        {
            $unwind: "$old_export_details"
        },
        {
            $unwind: "$products"
        },
        {
            $lookup: {
                from: "products",
                localField: "products.product",
                foreignField: "_id",
                as: "product_details"
            }
        },
        {
            $unwind: "$product_details"
        },
        {
            $lookup: {
                from: "productsuppliers",
                localField: "product_details.product",
                foreignField: "_id",
                as: "product_supplier_details"
            }
        },
        {
            $unwind: "$product_supplier_details"
        },
        {
            $group: {
                _id: {
                    warehouse: "$warehouse",
                    product: "$product_supplier_details._id"
                },
                totalQuantity: { $sum: "$products.number" },
                totalPriceBeforeDiscount: { $sum: { $multiply: ["$product_details.price", "$products.number"] } },
                totalPriceAfterDiscount: { $sum: { $multiply: [{ $subtract: ["$product_details.price", { $divide: ["$old_export_details.discount", 100] }] }, "$products.number"] } }
            }
        },
        {
            // Lựa chọn các trường để hiển thị
            $project: {
                _id: 0,
                warehouse: "$_id.warehouse",
                product: "$_id.product",
                totalQuantity: 1,
                totalPriceBeforeDiscount: 1,
                totalPriceAfterDiscount: 1
            }
        }
    ]);
    //----------------------------------------------------------------------------------------

    const productDifferent = await Product.find({
        supplier: { $exists: false },
        product: { $exists: false },
        // createdAt: { $gte: startDate, $lt: endDate },
        createdAt: { $gte: startDate, $lt: endDate },
    })
    await Promise.all(productDifferent.map(async productD => {
        warehouseOrder.push({
            totalQuantity: productD.number,
            totalPriceBeforeDiscount: productD.number * productD.price,
            totalPriceAfterDiscount: productD.number * productD.price,
            warehouse: productD.warehouse,
            product: productD._id

        })

        const productExportLastMonth = await WareHouseExport.find({
            "products.product": productD._id,
            createdAt: { $gte: startDate, $lt: endDate },

        })
        let dataPush = {
            totalQuantity: 0,
            totalPriceBeforeDiscount: 0,
            totalPriceAfterDiscount: 0,
            warehouse: productD.warehouse,
            product: productD._id

        }
        await Promise.all(productExportLastMonth.map(async product => {

            product.products.map(pr => {
                if (pr.product.toString() == productD._id.toString()) {
                    dataPush.totalQuantity += pr.number
                    dataPush.totalPriceBeforeDiscount += pr.number * productD.price
                    dataPush.totalPriceAfterDiscount += pr.number * productD.price * (1 - product.discount / 100)
                }
            })
        }))
        warehouseExport.push(dataPush)


        const productImportLastMonth = await WarehouseImport.find({
            "products.product": productD._id,
            // createdAt: { $gte: startDate, $lt: endDate },
            createdAt: { $gte: startDate, $lt: endDate },

        })

        await Promise.all(productImportLastMonth.map(async product => {
            let dataPush = {
                totalQuantity: 0,
                totalPriceBeforeDiscount: 0,
                totalPriceAfterDiscount: 0,
                warehouse: productD.warehouse,
                product: productD._id
            }
            product.products.map(pr => {
                if (pr.product.toString() == productD._id.toString()) {
                    dataPush.totalQuantity += pr.number
                    dataPush.totalPriceBeforeDiscount += pr.number * productD.price
                    dataPush.totalPriceAfterDiscount += pr.number * productD.price
                }
            })

            warehouseImport.push(dataPush)
        }))
    }))
    //true
    //------------------------------------------------------------------------------------

    const listOldReport = await ReportProduct.find({
        month: startDate.getMonth(),
        year: startDate.getFullYear(),
        end_inventory_quantity: { $gt: 0 }
    })

    await Promise.all(listOldReport.map(async report => {
        const currentReport = await ReportProduct.findOne({
            month: startDate.getMonth() + 1,
            year: startDate.getFullYear(),
            product: report.product
        })
        if (!currentReport) {
            await ReportProduct.create({
                month: startDate.getMonth() + 1,
                year: startDate.getFullYear(),
                begin_inventory_quantity: report.end_inventory_quantity,
                begin_inventory_value: report.end_inventory_value,
                warehouse: report.warehouse,
                product: report.product,
            })
        }

    }))
    await Promise.all(warehouseOrder.map(async order => {
        const oldReport = await ReportProduct.findOne({
            month: startDate.getMonth() + 1,
            year: startDate.getFullYear(),
            warehouse: order.warehouse,
            product: order.product ? order.product : order._id,
        })
        if (oldReport) {
            oldReport.current_period_quantity_in = order.totalQuantity
            oldReport.current_period_value_in = order.totalPriceAfterDiscount ? order.totalPriceAfterDiscount.toFixed(3) : 0
            await oldReport.save()
        } else {
            await new ReportProduct({
                month: startDate.getMonth() + 1,
                year: startDate.getFullYear(),
                warehouse: order.warehouse,
                product: order.product ? order.product : order._id,
                current_period_quantity_in: order.totalQuantity,
                current_period_value_in: order.totalPriceAfterDiscount ? order.totalPriceAfterDiscount.toFixed(3) : 0
            }).save()
        }

    }));
    await Promise.all(warehouseExport.map(async order => {
        if (order) {
            const oldReport = await ReportProduct.findOne({
                month: startDate.getMonth() + 1,
                year: startDate.getFullYear(),
                warehouse: order.warehouse,
                product: order.product ? order.product : order._id,
            })
            if (oldReport) {
                oldReport.current_period_quantity_out = order.totalQuantity
                oldReport.current_period_value_out = order.totalPriceAfterDiscount ? order.totalPriceAfterDiscount.toFixed(3) : 0
                await oldReport.save()
            } else {
                await new ReportProduct({
                    warehouse: order.warehouse,
                    product: order.product ? order.product : order._id,
                    current_period_quantity_out: order.totalQuantity,
                    current_period_value_out: order.totalPriceAfterDiscount ? order.totalPriceAfterDiscount.toFixed(3) : 0
                }).save()
            }
        }


    }));
    await Promise.all(warehouseImport.map(async order => {
        if (order) {
            const oldReport = await ReportProduct.findOne({
                month: startDate.getMonth() + 1,
                year: startDate.getFullYear(),
                warehouse: order.warehouse,
                product: order.product ? order.product : order._id,
            })
            if (oldReport) {
                oldReport.current_period_quantity_return = order.totalQuantity
                oldReport.current_period_value_return = order.totalPriceAfterDiscount ? order.totalPriceAfterDiscount.toFixed(3) : 0
                await oldReport.save()
            } else {
                await new ReportProduct({
                    warehouse: order.warehouse,
                    product: order.product ? order.product : order._id,
                    current_period_quantity_return: order.totalQuantity,
                    current_period_value_return: order.totalPriceAfterDiscount ? order.totalPriceAfterDiscount.toFixed(3) : 0
                }).save()
            }
        }


    }));

    const currentProducts = await ReportProduct.find({
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear(),
    })

    await Promise.all(currentProducts.map(async currentProduct => {
        //tìm báo cáo tháng trước để lấy tồn cuối kì
        const lastMonthProduct = await ReportProduct.findOne({
            month: startDate.getMonth(),
            year: startDate.getFullYear(),
            product: currentProduct.product,
            warehouse: currentProduct.warehouse
        })
        currentProduct.begin_inventory_quantity = lastMonthProduct ? lastMonthProduct.end_inventory_quantity : 0
        currentProduct.begin_inventory_value = lastMonthProduct ? lastMonthProduct.end_inventory_value : 0
        currentProduct.end_inventory_quantity = currentProduct.begin_inventory_quantity + currentProduct.current_period_quantity_in - currentProduct.current_period_quantity_out + currentProduct.current_period_quantity_return
        currentProduct.end_inventory_value = currentProduct.begin_inventory_value - currentProduct.current_period_value_in + currentProduct.current_period_value_out - currentProduct.current_period_value_return

        await ReportProduct.findOneAndUpdate({
            product: currentProduct.product,
            month: startDate.getMonth() + 1,
            year: startDate.getFullYear(),
            warehouse: currentProduct.warehouse
        }, currentProduct)
    }))
    return {
        warehouseOrder,
        warehouseExport,
        warehouseImport
    };
}

export const list = async ({ query: { month, year, warehouse }, user: currentUser }) => {
    // await reportOrder()
    const conditions = {}
    if (!month) throw new ParamError("Thiếu Tháng!")
    if (!year) throw new ParamError("Thiếu Năm!")
    if (month) conditions.month = month
    if (year) conditions.year = year
    if (!warehouse) throw new ParamError("Thiếu tên kho!")
    conditions.warehouse = warehouse
    await reportOrder(year, month)
    let listReport = await ReportProduct.find(conditions)
        .select("-_id -createdAt -updatedAt")
        .populate("warehouse", "name")
        .lean()
    // if (listReport.length == 0) {
    //     listReport = await ReportProduct.find(conditions)
    //         .select("-_id -createdAt -updatedAt")
    //         .populate("warehouse", "name")
    //         .lean()
    // }
    const result = await Promise.all(listReport.map(async report => {
        const nameProduct = await Product.findOne({ $or: [{ _id: report.product }, { product: report.product }] })
        return {
            ...report,
            name_product: nameProduct.name
        }
    }))
    return result
}
export const test = async () => {
    // const aaa = await reportOrder()
    // const aaa = await reportOrder(2024, 4)
    // console.log(aaa);
    let { startDate, endDate } = lastMonth(false)
    const { startDate: a, endDate: b } = getDate(2024, 4);
    return true
}