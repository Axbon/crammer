import fs from 'fs';
import path from 'path';
import { toValueArray } from './mapper';
import { parse } from './parser';
import { CramProps, Queryfn } from './types';

const mem = (fn: (props: CramProps) => Record<string, Queryfn>) => {
  const cache = new Map<string, Record<string, Queryfn>>();
  return (props: CramProps) => {
    const { dir } = props;
    const fromCache = cache.get(dir);
    /* Can't use cache.has() because of flow analysis problem in ts: 
       - https://github.com/microsoft/TypeScript/issues/13086
       */
    if (fromCache) {
      return fromCache;
    }
    const qs = fn(props);
    cache.set(dir, qs);
    return qs;
  };
};

const cram = mem(({ dir, adapter }: CramProps) => {
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
      [qname]: async (params) => {
        const { sql, mapping } = parse(sqlText);
        return adapter.query(sql, params && toValueArray(mapping, params));
      },
    };
  }, {} as Record<string, Queryfn>);
  return queries;
});

export const produce = (props: CramProps) => {
  const { adapter, dir } = props;
  if (!adapter.query || !adapter.connect || !adapter.end) {
    throw new Error(
      '[CRAMMER] Supplied db adapter does not appear to be a valid pg client. See node "pg" package'
    );
  }
  if (!fs.existsSync(path.join(process.cwd(), dir))) {
    throw new Error(`[CRAMMER] Directory not found ${dir}`);
  }
  return cram(props);
};
