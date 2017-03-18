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
};
