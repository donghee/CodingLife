import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

import React from "react";
import { render } from "react-dom";
import { ApolloProvider, Query } from "react-apollo";

const client = new ApolloClient({
  //uri: "https://w5xlvm3vzz.lp.gql.zone/graphql"
  uri: "http://localhost:4000/graphql"
});


const query = gql`
{
  users {
    name
    hobby
  }
}
`
console.log(query);

client
  .query({
    query: gql`
      {
        users {
          name
          hobby
        }
      }
    `
  })
  .then(result => console.log(result));


// Fetch GraphQL data with a Query component
const UserList = () => (
  <Query
    query={gql`
      query AllUsers
      {
        users {
          id
          name
          hobby
          profilePicture
          vehicles
        }
      }
    `}
    >

    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;

      return data.users.map(({ id, name, hobby, profilePicture, vehicles }) => (
        <div>
          <p>{`${id} ${name}: ${hobby}, ${profilePicture}, ${vehicles}`}</p>
        </div>
      ));
    }}
  </Query>
    );

// Fetch GraphQL data with a Query component
const User = () => (
  <Query
    query={gql`
      query User
      {
        user(id: 2) {
          id
          name
          hobby
        }
      }
    `}
    >

    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;

      return (
        <div>
          <p>{`${data.user.id} ${data.user.name}: ${data.user.hobby}`}</p>
        </div>
      );
    }}
  </Query>
    );

// Fetch GraphQL data with a Query component
const UserByVehicleId = () => (
  <Query
    query={gql`
      query User
      {
        userByVehicle(id: 3) {
          id
          name
          hobby
        }
      }
    `}
    >

    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;

      return data.userByVehicle.map(({ id, name, hobby }) => (
        <div>
          <p>{`${id} ${name}: ${hobby}`}</p>
        </div>
      ));
    }}
  </Query>
    );



const App = () => (
  <ApolloProvider client={client}>
    <div>
      <h2>My first Apollo app 🚀</h2>
      <h2> All Users </h2>
      <UserList />
      <h2> User By User ID </h2>
      <User />      
      <h2> User By Vehicle ID </h2>
      <UserByVehicleId />
    </div>
  </ApolloProvider>
);

render(<App />, document.getElementById("root"));

