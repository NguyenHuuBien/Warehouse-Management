import express from "express";
import * as EmployeeActions from '../../actions/EmployeeActions.js'
import * as CompanyActions from '../../actions/CompanyActions.js'
import * as WarehouseActions from '../../actions/WarehouseActions.js'
import * as SupplierActions from '../../actions/SupplierActions.js'
import * as CategoryActions from '../../actions/CategoryActions.js'
import * as ProductActions from '../../actions/ProductActions.js'
import * as WarehouseImportActions from '../../actions/WarehouseImportActions.js'
import * as WarehouseExportActions from '../../actions/WarehouseExportActions.js'
import * as OrderActions from '../../actions/OrderActions.js'
import * as NotifyActions from '../../actions/NotifyActions.js'
import * as Upload from '../../config/upload.js'
import { handleRequest } from "../../config/handle.js";
import * as ReportProductActions from "../../actions/ReportProductActions.js";
const router = express.Router()

//login
router.post("/login", handleRequest(EmployeeActions.login))

//Employee
router.post("/user/create", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.create))
router.put("/user/update/:id", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", 'manager']), handleRequest(EmployeeActions.update))
router.get("/user/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.get))
router.get("/user/list", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(EmployeeActions.list))
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
router.put("/supplier/update/:id", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(SupplierActions.update))
router.get("/supplier/get/:id", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(SupplierActions.get))
router.get("/supplier/list", EmployeeActions.verifyToken(["admin", "owner"]), handleRequest(SupplierActions.list))

//category
router.post("/category/create", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(CategoryActions.create))
router.put("/category/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(CategoryActions.update))
router.get("/category/list", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(CategoryActions.list))


//product
router.post("/product/create", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager", "supplier"]), handleRequest(ProductActions.create))
router.put("/product/update/:id", Upload.upload.single("image"), EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(ProductActions.update))
router.get("/product/get/:id", EmployeeActions.verifyToken(), handleRequest(ProductActions.get))
router.get("/product/list", EmployeeActions.verifyToken(), handleRequest(ProductActions.list))

//warehouse Import
router.post("/warehouse/import/create", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseImportActions.create))
router.put("/warehouse/import/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseImportActions.update))
router.get("/warehouse/import/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseImportActions.get))
router.get("/warehouse/import/list", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseImportActions.list))

//warehouse Export
router.post("/warehouse/export/create", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseExportActions.create))
router.put("/warehouse/export/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseExportActions.update))
router.get("/warehouse/export/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseExportActions.get))
router.get("/warehouse/export/list", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(WarehouseExportActions.list))

//order
router.post("/order/create", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(OrderActions.create))
router.put("/order/update/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(OrderActions.update))
router.get("/order/get/:id", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(OrderActions.get))
router.get("/order/list", EmployeeActions.verifyToken(["admin", "owner", "manager"]), handleRequest(OrderActions.list))

//notification
router.put("/notify/update", EmployeeActions.verifyToken(), handleRequest(NotifyActions.update))
router.get("/notify/list", EmployeeActions.verifyToken(), handleRequest(NotifyActions.list))

//test
router.get("/", handleRequest(ReportProductActions.reportOrder))
router.get("/list", handleRequest(ReportProductActions.list))

export default router