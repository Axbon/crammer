import { toValueArray } from '../src/mapper';
import { parse } from '../src/parser';

test('nested block comments', () => {
  const { sql, mapping } = parse(`
    SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public'
    /* Ignore :params in comments and also
      support multiline comments and nested
    /* nested block comment*/
      $preserved : preserved " :not_touched "
    */
  `);

  expect(sql).toEqual(`
    SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public'
    /* Ignore :params in comments and also
      support multiline comments and nested
    /* nested block comment*/
      $preserved : preserved " :not_touched "
    */
  `);

  expect(mapping.length).toBe(0);
});

test('param mapping', () => {
  const { sql, mapping } = parse(`
      SELECT 
        is_nullable 
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = :schemaName /* :notIncluded because of reasons */
      AND
        is_nullable = :isNullable
  `);

  expect(sql).toEqual(`
      SELECT 
        is_nullable 
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = $1 /* :notIncluded because of reasons */
      AND
        is_nullable = $2
  `);
  const params = { schemaName: 'public', isNullable: 'YES' };
  expect(toValueArray(mapping, params)).toMatchObject(['public', 'YES']);
});
