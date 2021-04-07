import pg from 'pg';

export type CramProps = {
  dir: string;
  adapter: pg.Client;
};

interface RecordI<T> {
  //Workaround because Record<> does not allow recursive type
  //https://github.com/microsoft/TypeScript/pull/33050#issuecomment-543365074
  [k: string]: T;
}

export type QueryParam =
  | number
  | string
  | boolean
  | null
  //pg conerts dates to timestamp/timestamptz/date
  | Date
  //pg converts objects/arrays using JSON stringify, for postgres "json" types, thus they are valid
  | RecordI<QueryParam>
  | Array<QueryParam>;

export type Queryfn = <T = any>(
  params?: Record<string, QueryParam>
) => Promise<pg.QueryResult<T>>;

export interface SqlParseResult {
  sql: string;
  mapping: ParamMapping[];
}

export interface ParamMapping {
  index: number;
  name: string;
}

export type ParserStateKey =
  | 'query'
  | 'quoted-ident'
  | 'string-constant'
  | 'line-comment'
  | 'block-comment'
  | 'consuming-ident'
  | 'skip-next'
  | 'dollar-quote-literal';

export interface ParserState {
  key: ParserStateKey;
  data?: any;
}
