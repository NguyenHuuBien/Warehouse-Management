import Employee from "./src/models/Employee.js";
import Notifications from "./src/models/Notifications.js";
//nếu disconnected thì user sẽ không thể nhận thông báo trực tiếp, thì sẽ phải lưu các thông báo cũ lại
//nếu user connect thì những thông báo cũ sẽ lấy ra các thông báo cũ đó với trạng thái chưa đọc

export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Lắng nghe khi người dùng đăng nhập
        socket.on('login', async (user) => {
            // Lấy thông báo từ db cho người dùng đăng nhập và gửi chúng
            try {
                const roomName = `${user.roles}-${user.warehouse}`;
                socket.join(roomName);

                const notifications = await Notifications.find({ receiver: user._id, status: 0 });
                notifications.forEach(async notification => {
                    socket.emit('notification', notification);
                    await notification.updateOne({ status: 1 })
                });

            } catch (error) {
                throw new Error("Lấy Thông báo lỗi")
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            Object.keys(socket.rooms).forEach(room => {
                socket.leave(room);
            });
        });

        socket.on('notification', async (user, message) => {
            try {
                const roomName = `${user.roles}-${user.warehouse}`;
                io.to(roomName).emit('notification', message);

                const oldUser = await Employee.find({ roles: user.roles }).select("_id roles")
                oldUser.forEach(async (eachUser) => {
                    if (eachUser !== user.roles) {
                        await new Notifications({
                            title: message.title,
                            content: message.content,
                            sender: user._id,
                            receiver: eachUser._id,
                        }).save()
                    }
                })
            } catch (error) {
                throw new Error(error)
            }
        });
    });
}