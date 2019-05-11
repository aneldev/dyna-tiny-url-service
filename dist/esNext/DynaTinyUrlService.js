import * as http from "http";
import { DynaNodeService, } from "dyna-node/dist/commonJs/node";
import { DynaDiskMemory } from "dyna-disk-memory/dist/commonJs/node";
import * as os from "os";
export var COMMAND_TinyURL_Get = "COMMAND_TinyURL_Get";
export var COMMAND_TinyURL_Response = "COMMAND_TinyURL_Response";
var DynaTinyUrlService = /** @class */ (function () {
    function DynaTinyUrlService(config) {
        var _this = this;
        var _a;
        this.config = config;
        this.memory = new DynaDiskMemory({ diskPath: os.tmpdir() + "/dyna-tiny-url-disk" });
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
                set: function (key, data) { return _this.memory.set('dturls', key, data); },
                get: function (key) { return _this.memory.get('dturls', key); },
                del: function (key) { return _this.memory.get('dturls', key); },
                delAll: function () { return _this.memory.delContainer('dturls'); },
            },
            onCommand: (_a = {},
                _a[COMMAND_TinyURL_Get] = {
                    executionTimeout: 5000,
                    execute: function (_a) {
                        var message = _a.message, reply = _a.reply, next = _a.next;
                        var url = message.data.url;
                        if (!url) {
                            reply({
                                command: "error",
                                args: { status: 422, message: "The url is not provided" },
                                data: null,
                            })
                                .catch(function (error) {
                                console.error('DynaTinyUrlService: Cannot reply to client 3rd party error', error);
                            });
                            next();
                            return; // exit
                        }
                        http.get("http://tinyurl.com/api-create.php?url=" + encodeURIComponent(url), function (res) {
                            res.on('data', function (chunk) {
                                var tinyUrl = chunk.toString();
                                reply({
                                    command: COMMAND_TinyURL_Response,
                                    args: null,
                                    data: {
                                        tinyUrl: tinyUrl,
                                        qrBarcode: "http://api.qrserver.com/v1/create-qr-code/?data=" + escape(tinyUrl) + "&format=svg",
                                    },
                                })
                                    .catch(function (error) {
                                    console.error('DynaTinyUrlService: Cannot reply to client the tiny url', error);
                                });
                                next();
                            });
                        }).on("error", function (error) {
                            reply({
                                command: "error",
                                args: { status: 503, message: "The 3rd party service failed", error: error },
                                data: null,
                            })
                                .catch(function (error) {
                                console.error('DynaTinyUrlService: Cannot reply to client 3rd party error', error);
                            });
                        });
                    },
                },
                _a),
            onReplySendFail: function (message, error, retry, skip, stop) { return skip(); },
            onServiceRegistrationFail: function (error) { return console.error('DynaTinyUrlService cannot register as service', error); },
            onMessageQueueError: function (error) { return console.error('DynaTinyUrlService error on service queue (disk error?)', error); },
        });
    }
    DynaTinyUrlService.prototype.start = function () {
        return this.service.start();
    };
    DynaTinyUrlService.prototype.stop = function () {
        return this.service.stop();
    };
    return DynaTinyUrlService;
}());
export { DynaTinyUrlService };
//# sourceMappingURL=DynaTinyUrlService.js.map