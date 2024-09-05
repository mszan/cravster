import { Migration } from "@mikro-orm/migrations";

export class Migration20231218195031 extends Migration {
  async up(): Promise<void> {
    this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  }

  async down(): Promise<void> {}
}
