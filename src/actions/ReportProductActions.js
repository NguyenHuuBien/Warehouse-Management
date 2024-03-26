import { EXPORT_STATUS, IMPORT_STATUS, ORDER_STATUS } from "../config/constant.js";
import Order from "../models/Order.js"
import ReportProduct from "../models/ReportProduct.js";
import Warehouse from "../models/Warehouse.js";
import WareHouseExport from "../models/WarehouseExport.js";
import WarehouseImport from "../models/WarehouseImport.js";
import { lastMonth } from "../utils/convert.js";

export const reportOrder = async (startDate, endDate, user) => {
    // let listWarehouse = await Warehouse.find({})

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
            $group: {
                _id: {
                    warehouse: "$warehouse",
                    product: "$products.product"
                },
                totalQuantity: { $sum: "$products.number" },
                totalPriceBeforeDiscount: { $sum: { $multiply: ["$products.price_order", "$products.number"] } },
                totalPriceAfterDiscount: { $sum: { $multiply: [{ $subtract: ["$products.price_order", { $divide: ["$discount", 100] }] }, "$products.number"] } }
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
                export_status: EXPORT_STATUS.RECEIVED
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
            $group: {
                _id: {
                    warehouse: "$warehouse",
                    product: "$products.product"
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
            $group: {
                _id: {
                    warehouse: "$warehouse",
                    product: "$products.product"
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

    await Promise.all(warehouseOrder.map(async order => {
        const oldReport = await ReportProduct.findOne({
            warehouse: order.warehouse,
            product: order.product,
        })
        if (oldReport) {
            oldReport.current_period_quantity_in = order.totalQuantity
            oldReport.current_period_value_in = order.totalPriceAfterDiscount.toFixed(3)
            await oldReport.save()
        } else {
            await new ReportProduct({
                warehouse: order.warehouse,
                product: order.product,
                current_period_quantity_in: order.totalQuantity,
                current_period_value_in: order.totalPriceAfterDiscount.toFixed(3)
            }).save()
        }

    }));
    await Promise.all(warehouseExport.map(async order => {
        const oldReport = await ReportProduct.findOne({
            warehouse: order.warehouse,
            product: order.product,
        })
        if (oldReport) {
            oldReport.current_period_quantity_out = order.totalQuantity
            oldReport.current_period_value_out = order.totalPriceAfterDiscount.toFixed(3)
            await oldReport.save()
        } else {
            await new ReportProduct({
                warehouse: order.warehouse,
                product: order.product,
                current_period_quantity_out: order.totalQuantity,
                current_period_value_out: order.totalPriceAfterDiscount.toFixed(3)
            }).save()
        }

    }));
    await Promise.all(warehouseImport.map(async order => {
        const oldReport = await ReportProduct.findOne({
            warehouse: order.warehouse,
            product: order.product,
        })
        if (oldReport) {
            oldReport.current_period_quantity_return = order.totalQuantity
            oldReport.current_period_value_return = order.totalPriceAfterDiscount.toFixed(3)
            await oldReport.save()
        } else {
            await new ReportProduct({
                warehouse: order.warehouse,
                product: order.product,
                current_period_quantity_return: order.totalQuantity,
                current_period_value_return: order.totalPriceAfterDiscount.toFixed(3)
            }).save()
        }

    }));
    //tìm kiếm của tháng trước và update vào tháng sau và update luôn tồn cuối kì
    // const {startDate, endDate}
    // const warehouses = await Warehouse.find({ company: user.company })
    // Promise.all(warehouses.map(async warehouse => {
    //     const products = await ReportProduct.find({ createdAt: { $gte: startDate, $lt: endDate }, warehouse: warehouse })
    //     products.map(async product => {

    //     })
    // }))
    return {
        warehouseImport: warehouseImport,
        warehouseExport: warehouseExport,
        warehouseOrder: warehouseOrder
    };
}

export const list = async ({ user }) => {
    const { startDate, endDate } = lastMonth()

    // const lastStartDate = new Date(year, month - 3, 2); // Ngày đầu tiên của tháng
    // const lastEndDate = new Date(year, month - 2, 2); // Ngày cuối cùng của tháng
    // const lastReport = await ReportProduct.findOne({ createdAt: { $gte: lastStartDate, $gt: lastEndDate } })


    const abc = await reportOrder(startDate, endDate)
    return { startDate, endDate }

}