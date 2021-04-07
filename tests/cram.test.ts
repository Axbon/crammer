import { produce } from '../src/crammer';
import { QueryParam } from '../src/types';
import { Client, QueryResult } from 'pg';

const mockAdapter = ({
  end: () => null,
  connect: () => null,
  query: jest.fn(
    (sql: string, values: QueryParam[]): Promise<QueryResult<any>> =>
      Promise.resolve({
        rows: [{ id: 1 }, { id: 2 }, { id: 3 }],
        command: 'stub',
        fields: [],
        oid: 0,
        rowCount: 3,
      })
  ),
} as unknown) as Client;

test('cram some queries', async () => {
  const queries = produce({
    adapter: mockAdapter,
    dir: 'tests/sql',
  });

  expect(queries).toHaveProperty('getTestData');
  expect(queries).toHaveProperty('getOtherData');

  const { getTestData } = queries;

  const { rows } = await getTestData();

  expect(rows).toMatchObject([{ id: 1 }, { id: 2 }, { id: 3 }]);
  expect(mockAdapter.query).toBeCalledTimes(1);
});

test('invalid directory', async () => {
  expect(() =>
    produce({
      adapter: mockAdapter,
      dir: 'tests/does_not_exist',
    })
  ).toThrow('[CRAMMER] Directory not found tests/does_not_exist');
});
