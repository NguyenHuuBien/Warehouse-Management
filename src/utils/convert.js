export const convertCode = (str, number) => {
    const numberString = String(number);
    const zeroCount = 6 - str.length - numberString.length;
    const zeros = "0".repeat(zeroCount > 0 ? zeroCount : 0);

    switch (str) {
        case 'NV':
            return str + zeros + numberString;
        case 'NCC':
            return str + zeros + numberString;
        case 'SP':
            return str + zeros + numberString;
        case 'NH':
            return str + zeros + numberString;
        case 'DH':
            return str + zeros + numberString;
        case 'TH':
            return str + zeros + numberString;
        default:
            break;
    }
}

export const convertNameSearch = (name) => {
    name = name.toLowerCase();
    const withoutDiacritics = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const underscored = withoutDiacritics.replace(/\s+/g, '_');
    return underscored;
}

export const lastMonth = () => {
    const currentDate = new Date(); // Lấy ngày hiện tại
    const year = currentDate.getFullYear(); // Lấy năm hiện tại
    const month = currentDate.getMonth() + 1; // Lấy tháng hiện tại (lưu ý: tháng trong JavaScript bắt đầu từ 0)
    const startDate = new Date(year, month - 2, 2); // Ngày đầu tiên của tháng
    const endDate = new Date(year, month - 1, 2); // Ngày cuối cùng của tháng
    return { startDate, endDate }
}