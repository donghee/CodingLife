# graphql server test second

Using apollo-server

## Install and Start

```
npm install
```

Start apollo-server or
```
node index.js
```

Start apollo-server-express
```
node index-server-express.js
```

## GraphQL

GraphQL Playground: http://localhost:4000/

### Query

Query users

```
query {
  users {
    name
    hobby
    profilePicture
    vehicles
  }
}
```

Response

```
{
  "data": {
    "users": [
      {
        "name": "Donghee Park",
        "hobby": "yoga",
        "profilePicture": "donghee.png",
        "vehicles": [
          1,
          3
        ]
      },
      {
        "name": "Hwayong Kim",
        "hobby": "yoha",
        "profilePicture": "circus.png",
        "vehicles": [
          2,
          3
        ]
      }
    ]
  }
}
```

----

Query user(id)

```
query {
  user(id: 2) {
    name
    hobby
    profilePicture
    vehicles
  }
}
```

Response

```
{
  "data": {
    "user": {
      "name": "Hwayong Kim",
      "hobby": "yoha",
      "profilePicture": "circus.png",
      "vehicles": [
        2,
        3
      ]
    }
  }
}
```

----

Query userByVehicle(id)

```
query {
  userByVehicle(id: 3) {
    id
    name
  }
}
```

Response

```
{
  "data": {
    "userByVehicle": [
      {
        "id": 1,
        "name": "Donghee Park"
      },
      {
        "id": 2,
        "name": "Hwayong Kim"
      }
    ]
  }
}
```
