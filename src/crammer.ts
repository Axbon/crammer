import fs from 'fs';
import { toValueArray } from 'mapper';
import { parse } from 'parser';
import path from 'path';
import pg, { Client } from 'pg';

import { CramProps, Queryfn, QueryParam } from './types';

export const cram = ({ dir, adapter }: CramProps) => {
	const filepath = path.join(process.cwd(), dir);
	const files = fs.readdirSync(filepath);
	const queries = files.reduce((cur, nex) => {
		if (path.extname(nex) !== '.sql') {
			return cur; //Skip none-.sql files
		}
		const sqlText = fs.readFileSync(path.join(filepath, nex), 'utf-8');
		const [qname] = nex.split('.sql');
		return {
			...cur,
			[qname]: async (params: Record<string, QueryParam>) => {
				const { sql, mapping } = parse(sqlText);
				return adapter.query(sql, toValueArray(mapping, params));
			},
		};
	}, {} as Record<string, Queryfn>);
	return queries;
};
