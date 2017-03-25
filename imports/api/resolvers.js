import { Meteor } from 'meteor/meteor';

export const Tasks = new Mongo.Collection('tasks');

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
      if (task.private && task.owner !== context.userId) {
        return null;
      }
      return new Promise(resolve => {
        Tasks.update(taskId, { $set: { checked: setChecked } }, () =>{
          resolve(Tasks.findOne(taskId));
        });
      });
    },
    setPrivate(root, args, context) {
      const taskId = args.id;
      const setToPrivate = args.setToPrivate;
      const task = Tasks.findOne(taskId);
      if (task.owner !== context.userId) {
        return null;
      }
      return new Promise(resolve => {
        Tasks.update(taskId, { $set: { private: setToPrivate } }, () =>{
          resolve(Tasks.findOne(taskId));
        });
      });
    },
  }
};
