import proxy from 'koa-proxies';
import getPort from 'get-port';
import { OAuth2Server } from 'oauth2-mock-server';

const oauth2server = new OAuth2Server();
/** @type number */
let oauthPort;

/* eslint-disable consistent-return */
export default {
  plugins: [
    {
      name: 'auth',
      async serverStart({ app }) {
        oauthPort = await getPort({port: getPort.makeRange(8000, 8100)});
        app.use(
          proxy('/auth', {
            target: `http://localhost:${oauthPort}`,
            logs: true,
            rewrite: path => path.replace('/auth', ''),
          }),
        );
        await oauth2server.issuer.keys.generateRSA();
        await oauth2server.start(oauthPort, 'localhost');
      },
      serve(context) {
        if (context.path === '/environment.js') {
          return `export default { oauth2: { port: ${oauthPort}, root: '/auth' } }`;
        }
      },
    },
  ],
};
