import cron from "node-cron"
import { reportOrder } from "../actions/ReportProductActions.js";
import { lastMonth } from "./convert.js";

// Lập lịch cho công việc được thực hiện vào cuối mỗi tháng
export const autoReport = () => {
    const job = cron.schedule('0 0 0 1 * *', async () => {
        try {
            let { startDate, endDate } = lastMonth(false)
            await reportOrder(startDate.getFullYear(), startDate.getMonth() + 1);
            // console.log('Report successfully generated for the month.');
        } catch (error) {
            // console.error('Error generating report:', error);
            throw new Error(error)
        }
    }, {
        scheduled: true,
        timezone: "UTC" // Chỉ định múi giờ là UTC
    });
}