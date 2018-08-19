const { find, filter } = require('lodash');
const { ApolloServer, gql } = require('apollo-server');

const users = [
  { id: 1, name: 'Donghee Park', hobby: 'yoga', profilePicture: 'donghee.png', vehicles: [1, 3]},
  { id: 2, name: 'Hwayong Kim', hobby: 'yoha', profilePicture: 'circus.png', vehicles: [2, 3]},
];

const vehicles = [
  { id: 1, name: 'Dronemap F450 Test Frame 1', uuid: 'dronemap-donghee', fc: 'PX4', protocol: 'mavlink', profilePicture: 'f450.png', missions: [1,2]},
  { id: 2, name: 'Dronemap F450 Test Frame 2', uuid: 'dronemap-doojin', fc: 'PX4', protocol: 'mavlink', profilePicture: 'f450.png', missions: [2] }
];

const missions = [
  { id: 1, name: 'Untitle 1', waypoints: [ {type: 'TAKEOFF', lat: 128.0, lon: 36.0, alt: 15.0}, {type: 'WAYPOINT', lat: 128.0, lon: 36.0, alt: 15.0}, {type: 'LAND', lat: 128.0, lon: 36.0, alt: 15.0} ]},
  { id: 2, name: 'Untitle 2', waypoints: [ {type: 'TAKEOFF', lat: 128.4, lon: 36.9, alt: 15.0}, {type: 'WAYPOINT', lat: 128.4, lon: 36.9, alt: 15.0}, {type: 'LAND', lat: 128.0, lon: 36.0, alt: 15.0} ]},
];

const typeDefs = gql`
  type User {
    id: Int
    name: String
    hobby: String
    profilePicture: String
    vehicles: [Int]
  }
  type Vehicle {
    id: Int
    name: String
    uuid: String
    fc: String
    protocol: String
    profilePicture: String
    missions: [Int]
  }
  type Query {
    users: [User]
    user(id: Int!): User
    userByVehicle(id: Int!): [User]
  }
`

const resolvers = {
  Query: {
    users: () => users,
    user: (parent, args, context, info) => find(users, { id: args.id }),
    userByVehicle: (parent, args, context, info) => filter(users, (user) => user.vehicles.includes(args.id))
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
