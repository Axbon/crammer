# Crammer

Literally _crams_ your precious sql queries into promise-based functions with typing support.
Joke aside, it will scan a directory of your choice for .sql files. It will then load those
files, prepare promise-based functions for you available in an object.

This enables you to manage all your .sql code in .sql files rather than having them inline
together with your other code. This is more secure, as in reduces the risk of accidentally
concatenating something or manipulating sql strings in a way that potentially opens up
for sql injection type of attacks.

Ideally, you should always manage .sql code in pure .sql files.

### Named params / parameterized queries

Postgres uses a convention for these types of params

```sql
INSERT INTO foo VALUES($1, $2, $3, $4);
```

However, this can quickly get nasty if you have a really large query and you use
the _"pg"_ package. You'll end up with a large array to map to these identifiers
within your query. Instead, you can use a simple object and it works the same way.
We'll still use postgres parameterized queries -- just remap the object attributes to
the correct param -- $1, $2, etc.

You can write your queries like so:

```sql
INSERT INTO foo VALUES(:userId, :firstname, :lastname, :email);
```

### mysql?

Right now this lib only supports postgres, I do plan to eventually add mysql support.
