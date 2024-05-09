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
        case 'HD':
            return str + zeros + numberString;
        case 'CT':
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

export const lastMonth = (previousMonth = true) => {
    const currentDate = new Date(); // Lấy ngày hiện tại
    const year = currentDate.getFullYear(); // Lấy năm hiện tại
    let month = currentDate.getMonth(); // Lấy tháng hiện tại (lưu ý: tháng trong JavaScript bắt đầu từ 0)

    if (previousMonth) {
        // Nếu muốn lấy tháng trước, giảm đi một tháng
        month -= 1;
        if (month < 0) {
            // Nếu tháng là tháng 1, chuyển năm về năm trước và đặt tháng là tháng 12
            year -= 1;
            month = 11;
        }
    }
    const startDate = new Date(Date.UTC(year, month, 1)); // Ngày đầu tiên của tháng với múi giờ UTC
    startDate.setUTCHours(0, 0, 0, 0); // Đặt thời gian thành 0 giờ UTC

    const endDate = new Date(Date.UTC(year, month + 1, 1)); // Ngày cuối cùng của tháng với múi giờ UTC
    endDate.setUTCHours(0, 0, 0, 0); // Đặt thời gian thành 0 giờ UTC

    return { startDate, endDate };
}

export const getDate = (year, month, lastMonth = true) => {


    if (lastMonth) {
        // Nếu muốn lấy tháng trước, giảm đi một tháng
        month -= 1;
        if (month < 0) {
            // Nếu tháng là tháng 1, chuyển năm về năm trước và đặt tháng là tháng 12
            year -= 1;
            month = 11;
        }
    }
    const startDate = new Date(Date.UTC(year, month, 1)); // Ngày đầu tiên của tháng với múi giờ UTC
    startDate.setUTCHours(0, 0, 0, 0); // Đặt thời gian thành 0 giờ UTC

    const endDate = new Date(Date.UTC(year, month + 1, 1)); // Ngày cuối cùng của tháng với múi giờ UTC
    endDate.setUTCHours(0, 0, 0, 0); // Đặt thời gian thành 0 giờ UTC

    return { startDate, endDate };
}

export const convertToStartTime = (startTime) => {
    // Convert start time to the beginning of the day
    const startDate = new Date(startTime);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
}

export const convertToEndTime = (stopTime) => {
    // Convert stop time to the end of the day
    const stopDate = new Date(stopTime);
    stopDate.setHours(23, 59, 59, 999);

    return stopDate;
}
