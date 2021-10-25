import fs from 'fs';
import path from 'path';
import pg, { PoolClient, Client } from 'pg';
import { toValueArray } from './mapper';
import { parse } from './parser';
import { BakedQueryFn, CramProps, Queryfn } from './types';

const crammerCache = new Map<string, Record<string, Queryfn>>();
const bakedQueryCache = new Map<string, Record<string, BakedQueryFn>>();

const cram = ({ dir, adapter }: CramProps) => {
  const cacheKey = (Array.isArray(dir) ? dir : [dir]).join(':');
  const fromCache = crammerCache.get(cacheKey);
  if (fromCache) {
    return fromCache;
  }

  const filepaths = Array.isArray(dir) ? dir : [dir];
  const sqlFns = getBakedSqlFunctions(filepaths);
  const sqlFnsKeys = Object.keys(sqlFns);
  const queries = sqlFnsKeys.reduce((cur, nex) => {
    return {
      ...cur,
      [nex]: async (params) => {
        const sqlFn = sqlFns[nex];
        const baked = sqlFn(params);
        return adapter.query(baked.sql, baked.params);
      },
    };
  }, {} as Record<string, Queryfn>);
  crammerCache.set(cacheKey, queries);
  return queries;
};

export const getBakedSqlFunctions = (filepaths: string[] = []) => {
  const cacheKey = filepaths.join(':');
  const fromCache = bakedQueryCache.get(cacheKey);
  if (fromCache) {
    return fromCache;
  }

  const queryContents = getSqlFileContents(filepaths);
  const queries = queryContents.reduce((cur, nex) => {
    const { queryName, sqlText } = nex;
    return {
      ...cur,
      [queryName]: (params) => {
        const { sql, mapping } = parse(sqlText);
        return {
          sql,
          params: params ? toValueArray(mapping, params) : undefined,
        };
      },
    };
  }, {} as Record<string, BakedQueryFn>);
  bakedQueryCache.set(cacheKey, queries);
  return queries;
};

export const getSqlFileContents = (filepaths: string[] = []) => {
  const files = filepaths
    .map((fp) => fs.readdirSync(fp).map((filename) => path.join(fp, filename)))
    .flat();
  //Skip none .sql files
  const sqlFileContents = files
    .filter((file) => path.extname(file) === '.sql')
    .map((file) => {
      const sqlText = fs.readFileSync(file, 'utf-8');
      const [queryName] = path.basename(file).split('.sql');
      return {
        queryName,
        sqlText,
      };
    });
  return sqlFileContents;
};

export const produce = (props: CramProps) => {
  const { adapter, dir } = props;
  const paths = Array.isArray(dir) ? dir : [dir];
  if (!adapter.query || !adapter.connect) {
    throw new Error(
      '[CRAMMER] Supplied db adapter does not appear to be a valid pg client. See node "pg" package'
    );
  }
  paths.forEach((path) => {
    if (!fs.existsSync(path)) {
      throw new Error(`[CRAMMER] Directory not found ${dir}`);
    }
  });

  return cram(props);
};
