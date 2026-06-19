"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250219000001 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20250219000001 extends migrations_1.Migration {
    async up() {
        this.addSql(`
      CREATE TABLE IF NOT EXISTS "qikink_product_mapping" (
        "id" VARCHAR NOT NULL PRIMARY KEY,
        "qikink_sku_id" VARCHAR NOT NULL,
        "variant_id" VARCHAR NOT NULL,
        "print_type_id" INTEGER NOT NULL DEFAULT 1 ,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE
      );
    `);
        this.addSql(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_qikink_product_mapping_qikink_sku_id"
      ON "qikink_product_mapping" ("qikink_sku_id")
      WHERE "deleted_at" IS NULL;
    `);
        this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_qikink_product_mapping_variant_id"
      ON "qikink_product_mapping" ("variant_id");
    `);
        this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_qikink_product_mapping_deleted_at"
      ON "qikink_product_mapping" ("deleted_at");
    `);
    }
    async down() {
        this.addSql(`DROP TABLE IF EXISTS "qikink_product_mapping";`);
    }
}
exports.Migration20250219000001 = Migration20250219000001;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTAyMTkwMDAwMDEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9xaWtpbmstcHJvZHVjdC1tYXBwaW5nL21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNTAyMTkwMDAwMDEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUVBQW9FO0FBRXBFLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFDcEQsS0FBSyxDQUFDLEVBQUU7UUFDTixJQUFJLENBQUMsTUFBTSxDQUFDOzs7Ozs7Ozs7O0tBVVgsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7OztLQUlYLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxNQUFNLENBQUM7OztLQUdYLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxNQUFNLENBQUM7OztLQUdYLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsZ0RBQWdELENBQUMsQ0FBQTtJQUMvRCxDQUFDO0NBQ0Y7QUFsQ0QsMERBa0NDIn0=