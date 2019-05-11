export interface IDynaTinyUrlServiceConfig {
    name?: string;
    serverDynaNodeAddress: string;
    serviceConnectionId: string;
    encryptionKey: string;
    accessKey: string;
    requestExpirationInMinutes?: number;
}
export declare const COMMAND_TinyURL_Get = "COMMAND_TinyURL_Get";
export interface ICOMMAND_TinyURL_Get_Data {
    url: string;
}
export declare const COMMAND_TinyURL_Response = "COMMAND_TinyURL_Response";
export interface ICOMMAND_TinyURL_Response_Data {
    tinyUrl: string;
    qrBarcode: string;
}
export declare class DynaTinyUrlService {
    private readonly config;
    private memory;
    private service;
    constructor(config: IDynaTinyUrlServiceConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
}
