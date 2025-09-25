import {gql} from "graphql-tag";

export const userTypeDefs=gql `
     type User{
        _id:ID!
        name:String!
        email:String!
        role:String!
        photo:String
        address:String
        assignedAgentId:ID
        assignedAgent:User
        createdAt:String
        updatedAt:String
     }
    type AuthPayload{
        token:String!
        user:User!
    }
    input SignupInput{
        name:String!
        email:String!
        password:String!
        role:String  # Optional - will be forced to 'customer'
        photo:String  # Base64 encoded image string
        address:String
    }
    input LoginInput{
        email:String!
        password:String!
    }
    type Query{
        users: [User!]!
        user(_id:ID!): User
        me: User
    }
    type Mutation{
        signup(input:SignupInput!):AuthPayload!
        login(input:LoginInput!):AuthPayload!
    }
`;