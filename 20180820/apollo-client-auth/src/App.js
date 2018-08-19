import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Link, Route, Redirect } from 'react-router-dom'
import Login from './Login'
import { AUTH_TOKEN } from './constants'

const GET_MISSIONS = gql`
  query {
    missions {
      id
      name
      createdAt
    }
  }
`

const MISSION_CREATED = gql`
  subscription {
    missionCreated {
      id
      name
      createdAt
    }
  }
`

class App extends React.Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    console.log(authToken)

    return (
      <div>
        <a href="/">
          <h1>GraphQL Auth</h1>
        </a>

        { authToken ? (
          <button onClick={ () => {
              localStorage.removeItem(AUTH_TOKEN)
              window.location.href = '/'
              this.props.history.push("/");
          }} > Logout </button>
        ) : (
          <div>
            <Link to="/login" > Login </Link>
          </div>
        ) }

          { authToken  && <Query query={GET_MISSIONS}>
            {({ data, loading, subscribeToMore }) => {
              if (!data) {
                return null
              }

              if (loading) {
                return <span>Loading ...</span>
              }

              return (
                <Missions
                  missions={data.missions}
                  subscribeToMore={subscribeToMore}
                />
              )
            }}
          </Query> }

      </div>
    )
  }
}


class Missions extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore({
      document: MISSION_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev

        return {
          missions: [
            ...prev.missions,
            subscriptionData.data.missionCreated,
          ],
        }
      },
    })
  }

  render() {
    return (
      <ul>
        {this.props.missions.map(mission => (
          <li key={mission.id}>{mission.name} -- {mission.createdAt}</li>
        ))}
      </ul>
    )
  }
}

export default App

