import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (room: string) => socket.join(room));
    socket.on('disconnect', () => undefined);
  });

  return io;
};

export const emitNotification = (room: string, payload: Record<string, unknown>) => {
  io?.to(room).emit('notification', payload);
};
