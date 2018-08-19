import React, { Component } from 'react'
import { AUTH_TOKEN } from './constants'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

const LOGIN_MUTATION = gql`
  mutation LoginMutation($name: String!, $password: String!) {
    login(name: $name, password: $password) {
      token
    }
  }
`

class Login extends Component {
  state = {
    name: '',
    password: '',
  }

  render() {
    const { password, name } = this.state
    return (
      <div>
        <a href="/">
          <h1>GraphQL Auth</h1>
        </a>

        <h2> Login </h2>
        <div>
          <label> name </label>
          <input
            value={name}
            onChange={e => this.setState({ name: e.target.value })}
            type="text"
            placeholder="Donghee Park" />
        </div>

        <div>
          <label> password </label>
          <input
            value={password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            placeholder="123" />

            <Mutation
              mutation={LOGIN_MUTATION}
              variables={{ name, password }}
              onCompleted={data => this._confirm(data)}
        >
              {mutation => (
                <button type="submit" onClick={mutation} >
                  Login
                </button>
              )}
            </Mutation>
        </div>
      </div>)
  }

  _confirm = async data => {
    const { token } = data.login
    localStorage.setItem(AUTH_TOKEN, token)
    console.log(AUTH_TOKEN)
    console.log(token)
    this.props.history.push('/')
  }
}

export default Login
