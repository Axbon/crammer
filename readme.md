# Crammer

Some of us strive to manage all of our sql code in pure .sql files. _Crammer_ helps you do that.

Scan a directory of your choice for .sql files. It will then load those
files, prepare promise-based functions for you available in an object.

This enables you to manage all your .sql code in .sql files rather than having them inline
together with your other code. This is more secure, as in reduces the risk of accidentally
concatenating something or manipulating sql strings in a way that potentially opens up
for sql injection type of attacks. Plus, it just looks better, more organized.

Few dependencies, only pg and types

### Version history

- 1.0 - The path to the .sql dir was relative to process.cwd()
- 2.0 - The path to the .sql dir has to be the full absolute path to the dir containing .sql files.

### Important

The _produce_ api in crammer is meant to be called once (per dir), eg when your application server/node process starts. It
loads the queries and then you're ready togo. It is not meant to be called multiple times as
in per-request or what have you, instead load the queries once and export those from a module.

It does cache the query-functions per directory should you accidentally call it a second time pointing
to the same directory/path.

### Api // examples

```ts
import pg, { Client } from 'pg';
import { produce } from 'crammer';

const client = new pg.Client({
  //Use env vars for this, this is just as an example
  user: 'postgres',
  host: 'localhost',
  database: 'yourdb',
  password: 'yourpass',
  port: 5432,
});

/*
 Given the following files in: path/to/sqlfiles
 - getCustomer.sql
 - addCustomer.sql

 You can now do:

*/

const queries = produce({
  dir: 'path/to/sqlfiles',
  adapter: client,
});

const { getCustomer, addCustomer } = queries;

const someApi = async () => {
  const { rows } = await getCustomer();
};

const secondApi = async () => {
  //Using named params
  const { rows } = await getCustomer({ id: 1 });
};

type Customer = {
  name: string;
  age: number;
};

const thirdApi = async () => {
  //Using optional type for return type
  const { rows } = await getCustomer<Customer>();
};
```

### Named params / parameterized queries

Postgres uses a convention for these types of params

```sql
INSERT INTO foo VALUES($1, $2, $3, $4);
```

However, this can quickly get nasty if you have a really large query and you use
the _"pg"_ package. You'll end up with a large array to map to these params
within your query. Instead, you can use a simple object and it works the same way.
We'll still use postgres parameterized queries -- just remap the object attributes to
the correct param -- $1, $2, etc.

You will want to write your queries like so to reference attribute name(s) in the params object
supplied to the query functions that crammer produces:

```sql
INSERT INTO foo ........ VALUES(:userId, :firstname, :lastname, :email);
```

Behind the scenes this is just simply converted to the good old style of:

```sql
INSERT INTO foo ........ VALUES($1, $2, $3, $4);
```

### mysql?

Right now this lib only supports postgres, I do plan to eventually add mysql support.
