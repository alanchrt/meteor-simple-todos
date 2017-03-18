import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { gql, graphql } from 'react-apollo';

import { Tasks } from '../api/tasks';

import Task from './Task';
import AccountsUIWrapper from './AccountsUIWrapper';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      hideCompleted: false,
    };
  }

  handleChange(event) {
    this.setState({
      text: event.target.value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { text } = this.state;
    Meteor.call('tasks.insert', text);
    this.setState({ text: '' });
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks() {
    const tasks = this.props.data.tasks;
    const currentUserId = this.props.data.currentUser && this.props.data.currentUser._id;
    const filteredTasks = tasks.filter(task => (
      !this.state.hideCompleted || !task.checked
    ));
    return filteredTasks.map(task => {
      const showPrivateButton = currentUserId === task.owner;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.data.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide completed tasks
          </label>

          <AccountsUIWrapper />

          { this.props.data.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
              <input
                type="text"
                placeholder="Type to add new tasks"
                value={this.state.text}
                onChange={this.handleChange.bind(this)}
                />
            </form> : ''
          }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  data: PropTypes.shape({
    tasks: PropTypes.array.isRequired,
    incompleteCount: PropTypes.number.isRequired,
    currentUser: PropTypes.object,
  }).isRequired,
};

export default graphql(gql`
  query AppQuery {
    tasks {
      _id
      text
      email
      owner
      checked
      private
      createdAt
    }
    incompleteCount
    currentUser {
      _id
    }
  }
`)(App);
