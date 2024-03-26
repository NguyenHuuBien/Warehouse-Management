import express from "express"
import morgan from "morgan"
import dayjs from "dayjs"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { adminControllers } from "./src/controllers/index.js"
import errorHandler from "./src/controllers/errorController.js"
import logger from "./src/config/logger.js"
import { NotFoundError } from "./src/config/errors.js"
import { createServer } from "http";
import { socketHandler } from "./socket.js"
import { Server } from "socket.io"
import cron from "node-cron"
import { reportOrder } from "./src/actions/ReportProductActions.js"

dotenv.config()
const app = express()
const server = createServer(app);
export const io = new Server(server, {
    connectionStateRecovery: {}
});
app.use(morgan('combined', { stream: logger.stream.write }))
dayjs.locale('vi')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoose.set('strictQuery', false)
process.env.NODE_ENV === "production" ? mongoose.connect(process.env.MONGODB_URI_PROD) : mongoose.connect(process.env.MONGODB_URI_DEV)
.then(()=> {
    console.log("Database connect successful");
})
.catch(()=> {
    console.log("Database connect fail");
})
//socket
socketHandler(io)

//auto report
cron.schedule("0 0 1 * *", async () => {
    const currentDate = new Date(); // Lấy ngày hiện tại
    const year = currentDate.getFullYear(); // Lấy năm hiện tại
    const month = currentDate.getMonth() + 1; // Lấy tháng hiện tại (lưu ý: tháng trong JavaScript bắt đầu từ 0)
    const startDate = new Date(year, month - 1, 1); // Ngày đầu tiên của tháng
    const endDate = new Date(year, month, 0); // Ngày cuối cùng của tháng

    await reportOrder(startDate, endDate)
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" // Chỉ định múi giờ
})

app.use('/test', (req, res) => {
    return res.json("Open")
})
app.use("/", adminControllers)

app.use((req, res, next) => {
    throw new NotFoundError(`${req.originalUrl} không tồn tại`)
})
//nếu có lõi thì sẽ convert error theo format trong errorHandle
app.use(errorHandler)
process.on('uncaughtException', function (err) {
    logger.error(`Caught exception: ${err.status} \n ${err.message}`)
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log("Server is running");
})