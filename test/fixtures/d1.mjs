import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

class Statement {
  constructor(statement) { this.statement = statement; this.values = []; }
  bind(...values) { this.values = values; return this; }
  run() { return { success: true, meta: { changes: Number(this.statement.run(...this.values).changes) } }; }
  first() { return this.statement.get(...this.values) || null; }
  all() { return { success: true, results: this.statement.all(...this.values) }; }
}

export class TestD1 {
  constructor({ identityMigration = true } = {}) {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec(fs.readFileSync(new URL('../../migrations/0001_learning_progress.sql', import.meta.url), 'utf8'));
    if (identityMigration) this.applyIdentityMigration();
  }
  applyIdentityMigration() {
    this.sqlite.exec(fs.readFileSync(new URL('../../migrations/0002_identity_links.sql', import.meta.url), 'utf8'));
  }
  prepare(sql) { return new Statement(this.sqlite.prepare(sql)); }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try {
      const results = statements.map(statement => statement.run());
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }
}
