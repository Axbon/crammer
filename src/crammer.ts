import fs from 'fs';
import path from 'path';
import pg, { Client } from 'pg';

import { CramProps, Queryfn } from './types';

export const cram = ({ dir, adapter }: CramProps) => {
	const filepath = path.join(process.cwd(), dir);
	const files = fs.readdirSync(filepath);
	const queries = files.reduce((cur, nex) => {
		if (path.extname(nex) !== '.sql') {
			throw new Error(`Found none-.sql file. bailing`);
		}
		const sql = fs.readFileSync(path.join(filepath, nex), 'utf-8');
		const [qname] = nex.split('.sql');
		return {
			...cur,
			[qname]: async (params) => {
				//TODO map to postgres style params
				return adapter.query('a', [1]);
			},
		};
	}, {} as Record<string, Queryfn>);
	return queries;
};
