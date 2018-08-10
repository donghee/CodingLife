import rethinkdb as r

r.connect('localhost', 28015).repl()
print r.db_list().run()

test = r.db('test')

authors = r.db('test').table('authors')
authors.filter({'name': 'William Adama'}).run()

for change in authors.changes().run():
  print change
