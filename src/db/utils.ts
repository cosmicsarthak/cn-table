/**
 * @see https://gist.github.com/rphlmr/0d1722a794ed5a16da0fdf6652902b15
 */

import { type AnyColumn, sql } from "drizzle-orm";
import { sqliteTableCreator } from "drizzle-orm/sqlite-core";

import { databasePrefix } from "@/lib/constants";

/**
 * Allows a single database instance for multiple projects.
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const sqliteTable = sqliteTableCreator((name) => `${databasePrefix}_${name}`);
export const sqliteTable = sqliteTableCreator((name) => name);
// This removes the prefix, so "orders" stays as "orders"

export function takeFirstOrNull<TData>(data: TData[]) {
  return data[0] ?? null;
}

export function takeFirstOrThrow<TData>(data: TData[], errorMessage?: string) {
  const first = takeFirstOrNull(data);

  if (!first) {
    throw new Error(errorMessage ?? "Item not found");
  }

  return first;
}

export function isEmpty<TColumn extends AnyColumn>(column: TColumn) {
  // SQLite compatible version
  return sql<boolean>`
    case
      when ${column} is null then 1
      when ${column} = '' then 1
      when ${column} = '[]' then 1
      when ${column} = '{}' then 1
      else 0
    end
  `;
}