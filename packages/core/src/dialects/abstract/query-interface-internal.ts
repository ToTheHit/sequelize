import assert from 'node:assert';
import { QueryTypes } from '../../query-types.js';
import type { QueryRawOptions, Sequelize } from '../../sequelize.js';
import type { AbstractQueryGenerator } from './query-generator.js';
import type { FetchDatabaseVersionOptions } from './query-interface.types.js';

/**
 * The methods in this class are not part of the public API.
 */
export class AbstractQueryInterfaceInternal {
  readonly #sequelize: Sequelize;
  readonly #queryGenerator: AbstractQueryGenerator;

  constructor(sequelize: Sequelize, queryGenerator: AbstractQueryGenerator) {
    this.#sequelize = sequelize;
    this.#queryGenerator = queryGenerator;
  }

  async fetchDatabaseVersionRaw<T extends object>(options?: FetchDatabaseVersionOptions): Promise<T> {
    const out = await this.#sequelize.queryRaw<T>(
      this.#queryGenerator.versionQuery(),
      { ...options, type: QueryTypes.SELECT, plain: true },
    );

    assert(out != null);

    return out;
  }

  async executeQueriesSequentially(queries: string[], options?: QueryRawOptions): Promise<unknown> {
    const results = [];
    for (const query of queries) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.#sequelize.queryRaw(query, { ...options });
      results.push(result);
    }

    return results;
  }
}
