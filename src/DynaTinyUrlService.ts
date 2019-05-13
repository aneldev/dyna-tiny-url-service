import * as http from "http";

import {
  DynaNodeService,
  DynaNodeMessage,
  IDynaNodeServiceCommandConfig,
} from "dyna-node/dist/commonJs/node";

import {IError} from "dyna-interfaces";

import {DynaDiskMemory} from "dyna-disk-memory/dist/commonJs/node";

import * as os from "os";

export interface IDynaTinyUrlServiceConfig {
  name?: string;
  serverDynaNodeAddress: string;
  serviceConnectionId: string;
  encryptionKey: string;
  accessKey: string;
  requestExpirationInMinutes?: number;                    // default: 0.5 min
}

export const COMMAND_TinyURL_Get = "COMMAND_TinyURL_Get";
export interface ICOMMAND_TinyURL_Get_Data {
  url: string;
}

export const COMMAND_TinyURL_Response = "COMMAND_TinyURL_Response";
export interface ICOMMAND_TinyURL_Response_Data {
  tinyUrl: string;
  qrBarcode: string; // qr barcode image with the tiny url
}

export class DynaTinyUrlService {
  private memory = new DynaDiskMemory({ diskPath: `${os.tmpdir()}/dyna-tiny-url-disk` });
  private service: DynaNodeService;

  constructor(private readonly config: IDynaTinyUrlServiceConfig) {
    this.service = new DynaNodeService({
      name: config.name,
      compressMessages: true,
      serviceRegistration: {
        serverDynaNodeAddress: config.serverDynaNodeAddress,
        serviceConnectionId: config.serviceConnectionId,
        encryptionKey: config.encryptionKey,
        accessKey: config.accessKey,
        requestExpirationInMinutes: config.requestExpirationInMinutes,
      },
      disk: {
        set: (key, data) => this.memory.set('dturls', key, data),
        get: (key) => this.memory.get('dturls', key),
        del: (key) => this.memory.get('dturls', key),
        delAll: () => this.memory.delContainer('dturls'),
      },
      onCommand: {
        [COMMAND_TinyURL_Get]: {
          executionTimeout: 5000,
          execute: ({ message, reply, next }) => {
            const { data: { url } } = message;

            if (!url) {
              reply<IError, null, null, null>({
                command: "error",
                args: { status: 422, message: "The url is not provided" },
                data: null,
              })
                .catch(error => {
                  console.error('DynaTinyUrlService: Cannot reply to client 3rd party error', error);
                });
              next();
              return; // exit
            }

            http.get(`http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, res => {
              res.on('data', chunk => {
                const tinyUrl = chunk.toString();
                reply<null, ICOMMAND_TinyURL_Response_Data, null, null>({
                  command: COMMAND_TinyURL_Response,
                  args: null,
                  data: {
                    tinyUrl,
                    qrBarcode: `http://api.qrserver.com/v1/create-qr-code/?data=${escape(tinyUrl)}&format=svg`,
                  },
                })
                  .catch(error => {
                    console.error('DynaTinyUrlService: Cannot reply to client the tiny url', error);
                  });
                next();
              });
            }).on("error", (error) => {
              console.error('TinyUrl 3rd party service failed', error);
              // The 3rd party failed but we can return the original url to do not the break the process.
              reply<null, ICOMMAND_TinyURL_Response_Data, null, null>({
                command: COMMAND_TinyURL_Response,
                args: null,
                data: {
                  tinyUrl: url,
                  qrBarcode: `http://api.qrserver.com/v1/create-qr-code/?data=${escape(url)}&format=svg`,
                },
              })
                .catch(error => {
                  console.error('DynaTinyUrlService: Cannot reply to client the tiny url', error);
                });
            });

          },
        } as IDynaNodeServiceCommandConfig<null, ICOMMAND_TinyURL_Get_Data>
      },
      onReplySendFail: (message: DynaNodeMessage, error: any, retry: () => void, skip: () => void, stop: () => void) => skip(),
      onServiceRegistrationFail: error => console.error('DynaTinyUrlService cannot register as service', error),
      onMessageQueueError: error => console.error('DynaTinyUrlService error on service queue (disk error?)', error),
    });
  }

  public start(): Promise<void> {
    return this.service.start();
  }

  public stop(): Promise<void> {
    return this.service.stop();
  }
}
