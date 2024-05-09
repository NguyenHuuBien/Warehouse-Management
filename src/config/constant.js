export const ROLES = ["admin", "owner", "manager", "employee"] //supplier

export const SEX = ['male', 'female']

export const UNIT = ['lit', 'cái', 'thùng', 'galon']

export const PAYMENT_STATUS = {
    NOT_PAY: 0, // chua thanh toan
    PAID: 1, // thanh toan het
    PAY_PART: 2, // thanh toan 1 phan
    CANCEL: 3
}

export const PAYMENT_METHOD = {
    ONLINE: 0, // thanh toán trực tiếp
    OFFLINE: 1 // thanh toán khi nhận hàng 
}

export const ORDER_STATUS = {
    DRAFT: 0,
    PENDING: 1, // đang chờ xử lý
    CONFIRM: 2, // xác nhận
    DELIVERY: 3, // đang giao hàng
    RECEIVED: 4, // Đã nhận
    CANCEL: 5, //hủy
}

export const EXPORT_STATUS = {
    CANCEL: 0,  //hủy
    OPEN: 1, //tạo phiếu
    DELIVERY: 2, // đang giao hàng
}

export const IMPORT_STATUS = {
    DELIVERY: 1, // đang giao về kho hàng
    RECEIVED: 2, // đã về kho
}

export const NOTIFY_STATUS = {
    UNREAD: 0,
    SEEN: 1
}