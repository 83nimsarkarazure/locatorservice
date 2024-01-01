const gql = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID
    name: String
    relation: String
    familyName: String
    mobileNumber: String
    locationHistory: [Location]
  }
  type Location {
    coordinates: [Float]
    timestamp: String
  }

  type Subscription {
    locationUpdated: [User]
  }

  type Query {
    greetings: String
    welcome(name: String!): String
    students: [Student] #return array of students
    student(id: ID): Student #return student by id
    users(familyName: String): [User]
    usersWithCurrentLocationHistory(familyName: String): [User]
    user(id: ID): Student #return student by id
  }
  input UserInput {
    name: String
    relation: String
    familyName: String
    mobileNumber: String
    locationHistory: [LocationInput]
  }

  input LocationInput {
    coordinates: [Float]
    timestamp: String
  }

  type Mutation {
    create(firstName: String, lastName: String, age: Int): Student
    registerUser(input: UserInput): Boolean
    sendOTP(mobileNumber: String): Boolean
    verifyOTP(mobileNumber: String, otp: String): Boolean
    updateLocationHistory(input: UserInput): User
  }

  # Student object
  type Student {
    id: ID
    firstName: String
    lastName: String
    age: Int
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

module.exports = typeDefs;
