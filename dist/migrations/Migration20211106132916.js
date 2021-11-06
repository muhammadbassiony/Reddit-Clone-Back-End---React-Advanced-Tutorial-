"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20211106132916 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20211106132916 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" timestamptz(0) not null);');
    }
}
exports.Migration20211106132916 = Migration20211106132916;
//# sourceMappingURL=Migration20211106132916.js.map