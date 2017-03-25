export const typeDefs = `
type Email {
  address: String
}

type User {
  _id: String
  emails: [Email]
}

type Task {
  _id: String
  text: String
  email: String
  owner: String
  checked: Boolean
  private: Boolean
  createdAt: String
}

type Query {
  tasks: [Task]
  incompleteCount: Int
  currentUser: User
}

type Mutation {
  addTask(text: String!): Task
  deleteTask(id: String!): Task
}
`;
