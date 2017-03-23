import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { gql, graphql } from 'react-apollo';
import classnames from 'classnames';
import update from 'immutability-helper';

import { Tasks } from '../api/tasks';

@graphql(gql`
  mutation deleteTask($id: String!) {
    deleteTask(id: $id) {
      _id
    }
  }
`, { name: 'deleteTask' })
export default class Task extends Component {
  constructor() {
    super()
  }

  toggleChecked() {
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
  }

  deleteThisTask() {
    const { task, deleteTask } = this.props;
    deleteTask({
      variables: { id: task._id },
      updateQueries: {
        AppQuery: (prev, { mutationResult }) => {
          let taskIndex;
          const deletedTask = mutationResult.data.deleteTask;
          prev.tasks.find((task, i) => {
            if (task._id === deletedTask._id) {
              taskIndex = i;
              return true;
            }
          });
          return update(prev, {
            tasks: {
              $splice: [[taskIndex, 1]],
            },
          });
        },
      },
    });
  }

  render() {
    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
    });

    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask.bind(this)}>
          &times;
        </button>

        <input
          type="checkbox"
          readOnly
          checked={!!this.props.task.checked}
          onClick={this.toggleChecked.bind(this)}
        />

        { this.props.showPrivateButton ?
          <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button> : ''
        }

        <span className="text">
          <strong>{this.props.task.email}</strong>: {this.props.task.text}
        </span>
      </li>
    );
  }
}

Task.propTypes = {
  task: PropTypes.object.isRequired,
  showPrivateButton: PropTypes.bool.isRequired,
};
