import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { gql, graphql } from 'react-apollo';
import classnames from 'classnames';
import update from 'immutability-helper';

@graphql(gql`
  mutation deleteTask($id: String!) {
    deleteTask(id: $id) {
      _id
    }
  }
`, {
  props: ({ ownProps, mutate }) => ({
    deleteTask: (taskId) => {
      return mutate({
        variables: { id: taskId },
        updateQueries: {
          AppQuery: (prev, { mutationResult }) => {
            let taskIndex;
            const deletedTask = mutationResult.data.deleteTask;
            prev.tasks.find((task, i) => {
              if (taskId === deletedTask._id) {
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
    },
  }),
})
@graphql(gql`
  mutation setChecked($id: String!, $setChecked: Boolean!) {
    setChecked(id: $id, setChecked: $setChecked) {
      _id
      text
      email
      owner
      checked
      private
      createdAt
    }
  }
`, {
  props: ({ ownProps, mutate }) => ({
    setChecked: (taskId, setChecked) => {
      return mutate({
        variables: { id: taskId, setChecked },
        updateQueries: {
          AppQuery: (prev, { mutationResult }) => {
            const checkedTask = mutationResult.data.setChecked;
            return update(prev, {
              tasks: {
                $apply: tasks => tasks.map(task => {
                  if (task._id === checkedTask._id) {
                    return checkedTask;
                  }
                  return task;
                }),
              },
            });
          },
        },
      });
    },
  }),
})
@graphql(gql`
  mutation setPrivate($id: String!, $setToPrivate: Boolean!) {
    setPrivate(id: $id, setToPrivate: $setToPrivate) {
      _id
      text
      email
      owner
      checked
      private
      createdAt
    }
  }
`, {
  props: ({ ownProps, mutate }) => ({
    setPrivate: (taskId, setToPrivate) => {
      return mutate({
        variables: { id: taskId, setToPrivate },
        updateQueries: {
          AppQuery: (prev, { mutationResult }) => {
            const returnedTask = mutationResult.data.setPrivate;
            return update(prev, {
              tasks: {
                $apply: tasks => tasks.map(task => {
                  if (task._id === returnedTask._id) {
                    return returnedTask;
                  }
                  return task;
                }),
              },
            });
          },
        },
      });
    },
  }),
})
export default class Task extends Component {
  constructor() {
    super()
  }

  toggleChecked() {
    const { setChecked } = this.props;
    setChecked(this.props.task._id, !this.props.task.checked);
  }

  togglePrivate() {
    const { setPrivate } = this.props;
    setPrivate(this.props.task._id, !this.props.task.private);
  }

  deleteThisTask() {
    const { task, deleteTask } = this.props;
    deleteTask(task._id);
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
