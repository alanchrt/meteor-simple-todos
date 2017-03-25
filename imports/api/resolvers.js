import { Meteor } from 'meteor/meteor';
import { Tasks } from './tasks';

export const resolvers = {
  Query: {
    tasks(root, args, context) {
      return Tasks.find({
        $or: [
          { private: { $ne: true } },
          { owner: context.userId },
        ],
      }, { sort: { createdAt: -1 } }).fetch();
    },

    incompleteCount(root, args, context) {
      return Tasks.find({
        $and: [
          { checked: { $ne : true } },
          { $or: [
            { private: { $ne: true } },
            { owner: context.userId },
          ] },
        ]
      }).count();
    },

    currentUser(root, args, context) {
      return context.user;
    },
  },
  Mutation: {
    addTask(root, args, context) {
      if (!context.userId) {
          return null;
      }

      const { text } = args;
      return new Promise(resolve => {
        Tasks.insert({
          text,
          createdAt: new Date(),
          owner: context.userId,
          email: Meteor.users.findOne(context.userId).emails[0].address,
        }, (err, taskId) => resolve(Tasks.findOne(taskId)));
      });
    },
    deleteTask(root, args, context) {
      const taskId = args.id;
      const task = Tasks.findOne(taskId);
      if (task.private && task.owner !== context.userId) {
        return null;
      }
      return new Promise(resolve => {
        Tasks.remove(taskId, () => resolve(task));
      });
    },
    setChecked(root, args, context) {
        const taskId = args.id;
        const setChecked = args.setChecked;
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
          return null;
        }
        return new Promise(resolve => {
          Tasks.update(taskId, { $set: { checked: setChecked } }, () =>{
            resolve(Tasks.findOne(taskId));
          });
        });
    },
  }
};
