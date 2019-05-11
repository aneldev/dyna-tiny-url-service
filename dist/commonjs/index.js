"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Export always from here for the types
var Person_1 = require("./person/Person");
exports.Person = Person_1.Person;
console.error("\nmy-module: Import error\n    You should import \"my-module/web\" or \"my-module/node\" (with lazy load or not) according the runtime environment.\n    For typescript, you should import the types from \"my-module\" but functional code from \"web\" or \"node\" versions.\n    More for how to import with conditional lazy load: https://github.com/aneldev/dyna-ts-module-boilerplate#how-to-import\n");
//# sourceMappingURL=index.js.map