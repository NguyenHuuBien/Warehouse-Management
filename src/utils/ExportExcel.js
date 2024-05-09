import ExcelJS from "exceljs";
import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

let tempFilePath = null;

export const exportAndDownloadExcel = async (req, res) => {
    try {
        if (tempFilePath) {
            // Nếu đã có file Excel tạm thời, xóa nó trước khi tạo một file mới
            fs.unlinkSync(tempFilePath);
            tempFilePath = null;
        }

        // Truy vấn dữ liệu từ model Product
        const products = await Product.find().populate('unit').populate('category').populate('supplier').populate('warehouse').exec();

        // Tạo một workbook mới với ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Products");

        // Tạo header cho worksheet
        worksheet.addRow(["Name", "ProductID", "Description", "Unit", "Price Import", "Price", "Number", "Position", "Length", "Width", "Height", "Weight", "Color", "Status", "Image", "Category", "Supplier", "Warehouse"]);

        // Ghi dữ liệu từ products vào worksheet
        products.forEach(product => {
            worksheet.addRow([
                product.name,
                product.sku,
                product.description,
                product.unit ? product.unit.name : "", // Lấy tên của đơn vị tính từ populate
                product.price_import,
                product.price,
                product.number,
                product.position,
                product.size.length,
                product.size.width,
                product.size.height,
                product.weight,
                product.color,
                product.status,
                product.img,
                product.category ? product.category.name : "", // Lấy tên của category từ populate
                product.supplier ? product.supplier.name : "", // Lấy tên của supplier từ populate
                product.warehouse ? product.warehouse.name : "" // Lấy tên của warehouse từ populate
            ]);
        });

        // Tạo tên tệp tạm thời
        tempFilePath = path.resolve(process.cwd(), "../server/src/utils/Products.xlsx");
        await workbook.xlsx.writeFile(tempFilePath);
        console.log("Data exported.");

        // Trả về file Excel cho client
        res.download(tempFilePath, "Products.xlsx", (err) => {
            if (err) {
                console.error("Error sending file: ", err);
                res.status(500).send("Error sending file");
            } else {
                console.log("File sent.");
            }
        });

        // Xóa tệp tạm thời sau 5 phút
        setTimeout(() => {
            if (tempFilePath) {
                fs.unlink(tempFilePath, (err) => {
                    if (err) {
                        console.error("Error deleting temporary file: ", err);
                    } else {
                        console.log("Temporary file deleted.");
                        tempFilePath = null;
                    }
                });
            }
        }, 5 * 60 * 1000); // 5 phút
    } catch (err) {
        console.error("Error exporting data: ", err);
        res.status(500).send("Error exporting data");
    }
};
