import { Server } from "socket.io";
import Message from "./models/Message.js";

let io;

const socketHandler = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust this for production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a room based on userId
        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId.toString());
                console.log(`User ${userId} joined their private room.`);
            }
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
                io.to(receiver.toString()).emit("receive_message", newMessage);

                // Optionally emit back to sender to confirm receipt/update UI
                io.to(sender.toString()).emit("message_sent", newMessage);

            } catch (error) {
                console.error("Error saving/sending message:", error);
            }
        });

        // Handle typing status
        socket.on("typing", (data) => {
            const { sender, receiver } = data;
            io.to(receiver.toString()).emit("user_typing", { sender });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId.toString()).emit(event, data);
    }
};

export default socketHandler;
