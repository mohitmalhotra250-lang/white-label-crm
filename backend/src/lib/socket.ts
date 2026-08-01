import { Server } from 'socket.io';
import http from 'http';

let io: Server | null = null;

export function initSocket(server: http.Server) {
  io = new Server(server, { cors: { origin: true, credentials: true } });
  io.on('connection', (socket) => {
    socket.on('subscribe', (clientId: string) => socket.join(`client:${clientId}`));
    socket.on('ping', () => socket.emit('pong'));
  });
  return io;
}

export function emitClientUpdate(clientId: string, payload: any) {
  if (io) io.to(`client:${clientId}`).emit('update', payload);
}
