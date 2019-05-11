# Dyna Tiny Url Service

Dyna Node Service that makes a URL tiny using the tinyurl.com api.

# Usage example

```
    // our server
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

    // This is our Tiny URL Service
    const service = new DynaTinyUrlService({
      name: "Dyna Tiny URL Service",
      serverDynaNodeAddress: 'n/localhost/57206',
      serviceConnectionId: 'dyna-tiny-url',
      encryptionKey: 'encryptionKey',
      accessKey: 'accessKey',
    });
    await service.start();

    // Our Client
    const client = new DynaNodeClient();

    // Let's ask it!
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
      });

```

See it in action running the test of this package.
 