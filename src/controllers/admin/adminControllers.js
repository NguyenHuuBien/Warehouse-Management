import express from "express";
import * as EmployeeActions from '../../actions/EmployeeActions.js'
import * as CompanyActions from '../../actions/CompanyActions.js'
import * as WarehouseActions from '../../actions/WarehouseActions.js'
import * as SupplierActions from '../../actions/SupplierActions.js'
import * as CategoryActions from '../../actions/CategoryActions.js'
import * as UnitActions from '../../actions/UnitActions.js'
import * as ProductActions from '../../actions/ProductActions.js'
import * as ProductSupplierActions from '../../actions/ProductSupplierActions.js'
import * as WarehouseImportActions from '../../actions/WarehouseImportActions.js'
import * as WarehouseExportActions from '../../actions/WarehouseExportActions.js'
import * as OrderActions from '../../actions/OrderActions.js'
import * as BillActions from '../../actions/BillActions.js'
import * as NotifyActions from '../../actions/NotifyActions.js'
import * as Upload from '../../config/upload.js'
import * as InsertData from '../../utils/InsertData.js'
import { handleRequest } from "../../config/handle.js";
import * as ReportProductActions from "../../actions/ReportProductActions.js";
import * as ExportExcel from "../../utils/ExportExcel.js"
const router = express.Router()

//login
router.post("/login", handleRequest(EmployeeActions.login))

//Employee
router.post("/user/create", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.create))
router.put("/user/update/:id", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.update))
router.get("/user/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.get))
router.get("/user/list", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.list))
router.get("/user/list/nopage", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.listNoPage))
router.post("/user/forgot", handleRequest(EmployeeActions.forgotPassword))

//company
router.post("/company/create", Upload.upload.single("logo"), handleRequest(CompanyActions.create))

//warehouse
router.post("/warehouse/create", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(WarehouseActions.create))
router.put("/warehouse/update/:id", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(WarehouseActions.update))
router.get("/warehouse/get/:id", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(WarehouseActions.get))
router.get("/warehouse/list", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(WarehouseActions.list))
router.get("/warehouse/list/nopage", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(WarehouseActions.listNoPage))

//supplier
router.post("/supplier/create", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(SupplierActions.create))
router.put("/supplier/update/:id", EmployeeActions.verifyToken(["admin", "owner", "supplier"]), handleRequest(SupplierActions.update))
router.get("/supplier/get/:id", EmployeeActions.verifyToken(["admin", "owner", "supplier", "manager"]), handleRequest(SupplierActions.get))
router.get("/supplier/list", EmployeeActions.verifyToken(["admin", "owner", "supplier", "manager"]), handleRequest(SupplierActions.list))
router.get("/supplier/list/nopage", EmployeeActions.verifyToken(["admin", "owner", "supplier", "manager"]), handleRequest(SupplierActions.listNoPage))

//category
router.post("/category/create", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(CategoryActions.create))
router.put("/category/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(CategoryActions.update))
router.get("/category/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(CategoryActions.get))
router.get("/category/list", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(CategoryActions.list))

//unit
router.post("/unit/create", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(UnitActions.create))
router.put("/unit/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(UnitActions.update))
router.get("/unit/list", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(UnitActions.list))

//product
router.post("/product/create", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(ProductActions.create))
router.post("/product/create/supplier", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(ProductActions.createFromSupplier))
router.put("/product/update/:id", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(ProductActions.update))
router.get("/product/get/:id", EmployeeActions.verifyToken(), handleRequest(ProductActions.get))
router.get("/product/list", EmployeeActions.verifyToken(), handleRequest(ProductActions.list))
router.get("/product/list/nopage", EmployeeActions.verifyToken(), handleRequest(ProductActions.listNoPage))

//product supplier
router.post("/product/supplier/create", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "supplier"]), handleRequest(ProductSupplierActions.create))
router.put("/product/supplier/update/:id", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "supplier"]), handleRequest(ProductSupplierActions.update))
router.get("/product/supplier/get/:id", EmployeeActions.verifyToken(["admin", "owner", "supplier", "manager"]), handleRequest(ProductSupplierActions.get))
router.get("/product/supplier/list", EmployeeActions.verifyToken(["admin", "owner", "supplier", "manager"]), handleRequest(ProductSupplierActions.list))
router.get("/product/supplier/list/nopage", EmployeeActions.verifyToken(["admin", "owner", "supplier", "manager"]), handleRequest(ProductSupplierActions.listNoPage))

//warehouse Import
router.post("/warehouse/import/create", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseImportActions.create))
router.put("/warehouse/import/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseImportActions.update))
router.get("/warehouse/import/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseImportActions.get))
router.get("/warehouse/import/list", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseImportActions.list))
router.get("/warehouse/import/list/nopage", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseImportActions.listNoPage))

//warehouse Export
router.post("/warehouse/export/create", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseExportActions.create))
router.put("/warehouse/export/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseExportActions.update))
router.get("/warehouse/export/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseExportActions.get))
router.get("/warehouse/export/list", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseExportActions.list))
router.get("/warehouse/export/list/nopage", EmployeeActions.verifyToken(["admin", "owner", "manager", "employee"]), handleRequest(WarehouseExportActions.listNoPage))


//order
router.post("/order/create", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(OrderActions.create))
router.put("/order/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(OrderActions.update))
router.get("/order/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(OrderActions.get))
router.get("/order/list", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(OrderActions.list))
router.get("/order/list/nopage", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(OrderActions.listNoPage))

//Bill
router.post("/bill/create", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(BillActions.create))
router.put("/bill/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(BillActions.update))
router.get("/bill/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(BillActions.get))
router.get("/bill/list", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(BillActions.list))
router.get("/bill/list/nopage", EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(BillActions.listNoPage))

//notification
router.put("/notify/update", EmployeeActions.verifyToken(), handleRequest(NotifyActions.update))
router.get("/notify/list", EmployeeActions.verifyToken(), handleRequest(NotifyActions.list))

//report
router.get("/report/list", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(ReportProductActions.list))
router.get("/report", handleRequest(ReportProductActions.test))

//insert data
router.get("/", handleRequest(InsertData.CEW))

//export product
router.get("/export", ExportExcel.exportAndDownloadExcel)
// router.get("/download", ExportExcel.downloadExcel)


export default router