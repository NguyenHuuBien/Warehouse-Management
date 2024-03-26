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
    } catch (error) {
        throw new Error(error)
    }
}