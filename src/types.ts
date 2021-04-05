import pg from 'pg';

export type CramProps = {
	dir: string;
	adapter: pg.Client;
};

export type QueryParam = number | string | boolean;

export type Queryfn = <T = any>(
	params: Record<string, QueryParam>
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
