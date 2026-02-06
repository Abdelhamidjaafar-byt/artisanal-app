import { Server } from "socket.io";
import Message from "./models/Message.js";

const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Adjust this for production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a room based on userId for private messaging
        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their private room.`);
        });

        // Handle sending message
        socket.on("send_message", async (data) => {
            const { sender, receiver, content } = data;

            try {
                // Save message to database
                const newMessage = await Message.create({
                    sender,
                    receiver,
                    content
                });

                // Emit to receiver's private room
                io.to(receiver).emit("receive_message", newMessage);

                // Optionally emit back to sender to confirm receipt/update UI
                io.to(sender).emit("message_sent", newMessage);

            } catch (error) {
                console.error("Error saving/sending message:", error);
            }
        });

        // Handle typing status
        socket.on("typing", (data) => {
            const { sender, receiver } = data;
            io.to(receiver).emit("user_typing", { sender });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export default socketHandler;
