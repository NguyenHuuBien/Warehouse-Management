export const ROLES = ["admin", "owner", "manager", "employee"] //supplier

export const SEX = ['male', 'female']

export const UNIT = ['lit', 'cái', 'thùng', 'galon']

export const PAYMENT_STATUS = {
    NOT_PAY: 0, // chua thanh toan
    PAID: 1, // thanh toan het
    PAY_PART: 2, // thanh toan 1 phan
}

export const PAYMENT_METHOD = {
    ONLINE: 0, // thanh toán trực tiếp
    OFFLINE: 1 // thanh toán khi nhận hàng 
}

export const IMPORT_STATUS = {
    CANCEL: 0,  //hủy
    OPEN: 1, //tạo phiếu
    DONE: 2 //hoàn thành
}

export const ORDER_STATUS = {
    CANCEL: 0, //hủy
    PENDING: 1, // đang chờ xử lý
    CONFIRM: 2, // xác nhận
    BOX: 3, // đang đóng hàng
    DELIVERY: 4, // đang giao hàng
    DELIVERY_SUCCESS: 5, // giao hàng thành công
    DELIVERY_FAIL: 6, // giao hàng thất bại
    RETURN: 7, // trả hàng
    COMPLETE: 8 // hoàn thành
}
// export const LOGIN = {
//     FAIL_NUMBER_MAX: 20,
//     NEXT_MINUTES_AFTER_FAIL: 5,
// }

// export const NOTIFICATION_TYPE_SYSTEM = {
//     SERVICE: 1,
//     SYSTEM: 2,
// }

// export const ORDER_IMAGES_LIMIT = 6

// export const TYPE_QUOTE = ['service', 'repair', 'product']

// export const STATUS_ORDER = {
//     REJECT: 0,
//     OPEN: 1,
//     QUOTE: 2,
//     FIXING: 3,
//     DONE: 4,
//     DELIVERY: 5,
// }

// export const STATUS_DEPARTMENT_SCHEDULER = {
//     REJECT: 0,
//     OPEN: 1,
//     ACCEPTED: 2,
// }

// export const STATUS_SALE_ORDER = {
//     CANCEL: 0,
//     OPEN: 1,
//     PACKED: 2,
//     SHIPPING: 3,
//     DONE: 4
// }
// export const STATUS_WAREHOUSE_IMPORT = {
//     CANCEL: 0,
//     OPEN: 1,
//     PACKED: 2,
//     DONE: 3,
// }



// export const WAREHOUSE_IMPORT = {
//     STATUS: {
//         CANCEL: 0,
//         OPEN: 1,
//         PACKED: 2,
//         DONE: 3,
//     }
// }

// export const STATUS_WAREHOUSE_CHECK = {
//     CANCEL: 0,
//     DRAFT: 1,
//     DONE: 2,
// }

// export const STATUS_WAREHOUSE_EXCHANGE = {
//     CANCEL: 0,
//     DRAFT: 1,
//     SHIPPING: 2,
//     DONE: 3,
// }

// export const STATUS_WAREHOUSE_ADJUST_PRICE = {
//     CANCEL: 0,
//     DRAFT: 1,
//     DONE: 2,
// }

// export const PAYMENT_METHOD_IMPORT = {
//     NOT_PURCHASE: 1,
//     A_PART_PURCHASE: 2,
//     FULL_PURCHASE: 3,
// }

// export const PAYMENT_METHOD = {
//     COD: 1,
//     TRANSFER: 3,
// }

// export const PRODUCT = {
//     TYPE: {
//         PRODUCT: 1,
//         SERVICE: 2,
//     },
//     STATUS: {
//         INACTIVE: 0,
//         ACTIVE: 1,
//     }
// }

// export const RECEIPT = {
//     INCOME_TYPE: {
//         DEBT: 1,
//         DEPOSIT: 2,
//         OTHERS: 3,
//         AUTO: 4,
//     },
//     OUTCOME_TYPE: {
//         SHIPPING: 1,
//         PRODUCTION_COST: 2,
//         MATERIAL_COST: 3,
//         FIXED_ASSET: 4,
//         INSURANCE: 5,
//         LIVING_COST: 6,
//         SALARY: 7,
//         OTHERS: 8,
//         AUTO: 9
//     },
//     STATUS: {
//         DRAFT: 1,
//         DONE: 2,
//     },
//     PAYMENT_METHOD: {
//         COD: 1,
//         CASH: 2,
//         BANK: 3,
//         CARD: 4,
//     },
//     OBJECT_TYPE: {
//         CUSTOMER: 1,
//         STAFF: 2,
//         SUPPLIER: 3,
//         SHIPPING: 4,
//     },
//     AUTO_NOTE: {
//         ORDER: "Phiếu thu tự động từ phiếu tiếp nhận xe đã xuất xưởng",
//         SALE_ORDER: "Phiếu thu tự động từ đơn hàng",
//         WAREHOUSE_IMPORT: "Phiếu chi tự động từ đơn nhập hàng",
//         RETURN_ORDER: "Phiếu chi tự động từ đơn trả hàng"
//     }
// }

