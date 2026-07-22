import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';

let io: Server | undefined;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN },
  });

  io.on('connection', (socket) => {
    // Dashboard uzaposlenih prati sve porudzbine restorana
    socket.on('dashboard:join', () => {
      socket.join('dashboard');
    });

    // Kupac prati samo svoju porudzbinu
    socket.on('order:track', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) throw new Error('Socket.IO nije inicijalizovan - pozovi initSocket() prvo');
  return io;
}

export function emitOrderStatusChanged(order: { id: string; status: string }) {
  if (!io) return;
  io.to('dashboard').emit('order:status', order);
  io.to(`order:${order.id}`).emit('order:status', order);
}

export function emitNewOrder(order: unknown) {
  if (!io) return;
  io.to('dashboard').emit('order:new', order);
}
