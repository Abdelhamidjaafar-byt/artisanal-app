import { io, Socket } from "socket.io-client";

// Define the URL for the socket server
// In production, this should be an environment variable
const SOCKET_URL = "http://localhost:3000";

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string) {
        if (this.socket) {
            return;
        }

        this.socket = io(SOCKET_URL);

        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket?.id);
            // Join user specific room
            this.socket?.emit("join", userId);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketService = new SocketService();
