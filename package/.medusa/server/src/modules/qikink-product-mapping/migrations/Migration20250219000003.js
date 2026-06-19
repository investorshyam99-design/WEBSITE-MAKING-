"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250219000003 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20250219000003 extends migrations_1.Migration {
    async up() {
        this.addSql(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_qikink_product_mapping_variant_id_unique"
      ON "qikink_product_mapping" ("variant_id")
      WHERE "deleted_at" IS NULL;
    `);
    }
    async down() {
        this.addSql(`
      DROP INDEX IF EXISTS "IDX_qikink_product_mapping_variant_id_unique";
    `);
    }
}
exports.Migration20250219000003 = Migration20250219000003;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTAyMTkwMDAwMDMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9xaWtpbmstcHJvZHVjdC1tYXBwaW5nL21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNTAyMTkwMDAwMDMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUVBQW9FO0FBRXBFLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFDcEQsS0FBSyxDQUFDLEVBQUU7UUFDTixJQUFJLENBQUMsTUFBTSxDQUFDOzs7O0tBSVgsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7S0FFWCxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0Y7QUFkRCwwREFjQyJ9