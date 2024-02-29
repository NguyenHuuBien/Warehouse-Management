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

dotenv.config()
const app = express()
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
const listerner = app.listen(PORT, () => {
    console.log("Server is running");
})