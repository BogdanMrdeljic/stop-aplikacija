import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initSocket } from './sockets';

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`Stop backend slusa na portu ${env.PORT}`);
});
