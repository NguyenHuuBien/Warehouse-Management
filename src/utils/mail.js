import nodemailer from "nodemailer"

export const sendEmail = async (to, subject, text) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: {
            user: process.env.EMAIL, // Email của bạn
            pass: process.env.PASS // Mật khẩu email của bạn
        }
    });

    let mailOptions = {
        from: process.env.EMAIL, // Email của bạn
        to: to,
        subject: subject,
        html: text
    };

    await transporter.sendMail(mailOptions);
};

export const verifyEmail = async (email, username, password) => {
    try {
        const subject = "Xác thực tài khoản"
        const text = `
            <p>Chào mừng bạn đến với ứng dụng của chúng tôi!</p>
            <p>Dưới đây là thông tin tài khoản của bạn:</p>
            <p>Tên đăng nhập: ${username}</p>
            <p>Mật khẩu: ${password}</p>
            <p>Vui lòng nhấn vào nút dưới đây để xác thực email:</p>
            <a href="https://huyenxinhgaivaio.vercel.app/pages/verify-email">
                <button style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px;">Xác thực Email</button>
            </a>
        `
        await sendEmail(email, subject, text)
        return true
    } catch (error) {
        throw new Error(error)
    }
}
export const verifyEmailUpdate = async (email, code) => {
    try {
        const subject = "Xác thực Email"
        const text = `
            <p>Dưới đây là mã xác thực Email của bạn:</p>
            <p>Mã: ${code}</p>
            <p>Vui lòng quay lại trang chủ và nhập mã xác thực:</p>
            <a href="https://huyenxinhgaivaio.vercel.app/pages/verify-email">
                <button style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px;">Xác thực Email</button>
            </a>
        `
        await sendEmail(email, subject, text)
        return true

    } catch (error) {
        throw new Error(error)
    }
}

export const mailPassword = async (email, username, password) => {
    try {
        const subject = "Quên mật khẩu"
        const text = `
            <p>Dưới đây là thông tin tài khoản của bạn:</p>
            <p>Tên đăng nhập: ${username}</p>
            <p>Mật khẩu: ${password}</p>
            <p>Vui lòng đổi mật khẩu sau khi đăng nhập lại</p>
            <a href="https://huyenxinhgaivaio.vercel.app/pages/login/">
                <button style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px;">Trang chủ</button>
            </a>
        `
        await sendEmail(email, subject, text)
        return true

    } catch (error) {
        throw new Error(error)
    }
}

export const confirmOrder = async (email, nameCompany) => {
    try {
        const subject = "Đơn hàng mới"
        const text = `
            <p>Bạn có 1 đơn hàng mới từ công ty ${nameCompany}</p>
            <p>Vui lòng Đăng nhập để xem thông tin đơn hàng</p>
            <a href="https://huyenxinhgaivaio.vercel.app/pages/login/">
                <button style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px;">Trang chủ</button>
            </a>
        `
        await sendEmail(email, subject, text)
        return true

    } catch (error) {
        throw new Error(error)
    }
}