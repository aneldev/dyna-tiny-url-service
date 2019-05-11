import "jest";

if (typeof jasmine !== 'undefined') jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

import {
  DynaNodeClient,
  DynaNodeServer,
} from "dyna-node/dist/commonJs/node";

import {
  COMMAND_TinyURL_Get,
  DynaTinyUrlService,
  ICOMMAND_TinyURL_Get_Data,
  ICOMMAND_TinyURL_Response_Data
} from "../../src/DynaTinyUrlService";

// help: https://facebook.github.io/jest/docs/expect.html

describe('DynaTinyUrlService', () => {
  it('It shorts a url', async (done) => {

    const server = new DynaNodeServer({
      addresses: {
        internal: 'n/localhost/57206',
        external: 'n/localhost/57206',
      },
      connectionIds: {
        'dyna-tiny-url': {
          encryptionKey: 'encryptionKey',
          accessKey: 'accessKey',
        },
      },
    });

    await server.start();

    const service = new DynaTinyUrlService({
      name: "Dyna Tiny URL Service",
      serverDynaNodeAddress: 'n/localhost/57206',
      serviceConnectionId: 'dyna-tiny-url',
      encryptionKey: 'encryptionKey',
      accessKey: 'accessKey',
    });

    await service.start();

    const client = new DynaNodeClient();

    client.sendReceive<null, ICOMMAND_TinyURL_Get_Data, null, ICOMMAND_TinyURL_Response_Data>({
      to: 'dyna-tiny-url@n/localhost/57206',
      command: COMMAND_TinyURL_Get,
      args: null,
      data: {
        url: 'http://www.anel.co/example/long/path/long/path/long/path/long/path/long/path/long/path/long/path/long/path',
      }
    })
      .then(reply => {
        console.log('shorten url:', reply.data.tinyUrl);
        console.log('qr barcode:', reply.data.qrBarcode);
        expect(reply.data.tinyUrl.length).toBeLessThan(40);
        expect(reply.data.tinyUrl.indexOf('http://tinyurl.com/')).toBe(0);
      })
      .catch(error => {
        console.error('TEST: cannot send the get message', error);
      })
      .then(async () => {
        await client.closeAllConnections();
        await service.stop();
        await server.stop();
        done();
      });

  });
});
