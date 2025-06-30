import csv

header = f'''
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <link href="address.css" rel="stylesheet">
    <title>Address Sticker</title>
    <meta name="description" content="Address Sticker">
  </head>

  <body>'''


body = ''

with open('address.csv', newline='') as csvfile:
   addresses = csv.reader(csvfile, delimiter='\t', quotechar='|')
   # print(addresses)
   for row in addresses:
     body = body + f'''
    <div id="informations">
      <section id="mail">
        <h1 id="address">서울시 구로구 부일로 15가길 3 나동 401호</h1>
        <h1 id="zipcode">08256</h1>
        <h1 id="name">박동희</h1>
      </section>

      <section id="mail">
        <h1 id="address">{row[1]}</h1>
        <h1 id="zipcode">{row[2]}</h1>
        <h1 id="name">{row[0]}</h1>
      </section>
    </div>
     '''

footer = f'''  </body>
</html>'''

print(header)
print(body)
print(footer)
