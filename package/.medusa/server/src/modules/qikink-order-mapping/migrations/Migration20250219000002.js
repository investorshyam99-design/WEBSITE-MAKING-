"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250219000002 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20250219000002 extends migrations_1.Migration {
    async up() {
        this.addSql(`
      CREATE TABLE IF NOT EXISTS "qikink_order_mapping" (
        "id" VARCHAR NOT NULL PRIMARY KEY,
        "qikink_order_id" VARCHAR NOT NULL,
        "medusa_order_id" VARCHAR NOT NULL,
        "status" VARCHAR NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE
      );
    `);
        this.addSql(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_qikink_order_mapping_qikink_order_id"
      ON "qikink_order_mapping" ("qikink_order_id")
      WHERE "deleted_at" IS NULL;
    `);
        this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_qikink_order_mapping_medusa_order_id"
      ON "qikink_order_mapping" ("medusa_order_id");
    `);
        this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_qikink_order_mapping_status"
      ON "qikink_order_mapping" ("status");
    `);
        this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_qikink_order_mapping_deleted_at"
      ON "qikink_order_mapping" ("deleted_at");
    `);
    }
    async down() {
        this.addSql(`DROP TABLE IF EXISTS "qikink_order_mapping";`);
    }
}
exports.Migration20250219000002 = Migration20250219000002;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTAyMTkwMDAwMDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9xaWtpbmstb3JkZXItbWFwcGluZy9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjUwMjE5MDAwMDAyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlFQUFvRTtBQUVwRSxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBQ3BELEtBQUssQ0FBQyxFQUFFO1FBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQzs7Ozs7Ozs7OztLQVVYLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxNQUFNLENBQUM7Ozs7S0FJWCxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsTUFBTSxDQUFDOzs7S0FHWCxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsTUFBTSxDQUFDOzs7S0FHWCxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsTUFBTSxDQUFDOzs7S0FHWCxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUE7SUFDN0QsQ0FBQztDQUNGO0FBdkNELDBEQXVDQyJ9