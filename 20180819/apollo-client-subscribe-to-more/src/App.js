import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_MISSIONS = gql`
  query {
    missions {
      id
      name
      createdAt
    }
  }
`;

const MISSION_CREATED = gql`
  subscription {
    missionCreated {
      id
      name
      createdAt
    }
  }
`;

const App = () => (
  <Query query={GET_MISSIONS}>
    {({ data, loading, subscribeToMore }) => {
      if (!data) {
        return null;
      }

      if (loading) {
        return <span>Loading ...</span>;
      }

      return (
        <Missions
          missions={data.missions}
          subscribeToMore={subscribeToMore}
        />
      );
    }}
  </Query>
);

class Missions extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore({
      document: MISSION_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          missions: [
            ...prev.missions,
            subscriptionData.data.missionCreated,
          ],
        };
      },
    });
  }

  render() {
    return (
      <ul>
        {this.props.missions.map(mission => (
          <li key={mission.id}>{mission.name} -- {mission.createdAt}</li>
        ))}
      </ul>
    );
  }
}

export default App;

