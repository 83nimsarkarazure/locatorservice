var neo4j = require('neo4j-driver');
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
import { json } from 'stream/consumers';
import Student from '../models/Student';
import User from '../models/User';
const mongoose = require("mongoose");
const neo4jDriver = require('../models/neo4j');

// const Student = mongoose.model("Student", {
//     firstName: String,
//     lastName: String,
//     age: Number,
// });

const resolvers = {
    Query: {
        greetings: () => "GraphQL is Awesome",
        welcome: async (parent: any, args: any) => {
            const obj = await User.findOne({ 'username': args.name });
            console.log('calling ...........');
            console.log(obj);
            return `Hello ${args.name}`;
        },
        students: async () => await Student.find({}),
        student: async (parent: any, args: any) => await Student.findById(args.id),
        users: async (parent: any, args: any) => {
            let users = await User.find({ familyName: args.familyName });
            return users;
        },
        usersWithCurrentLocationHistory: async (parent: any, args: any) => {
            let users = await User.find({ familyName: args.familyName });
            users = users.map(user => {
                if (user.locationHistory && user.locationHistory.length > 0) {
                    user.locationHistory = [user.locationHistory[user.locationHistory.length - 1]];
                }
                return user;
            });
            return users;
        },
        user: async (parent: any, args: any) => await User.findById(args.id),
        // Implement other query resolvers here
    },
    Mutation: {
        create: async (parent: any, args: any) => {
            const { firstName, lastName, age } = args;
            const newStudent = new Student({
                firstName,
                lastName,
                age,
            });
            await newStudent.save();
            return newStudent;
        },
        updateLocationHistory: async (parent: any, args: any) => {
            const { input } = args;
            try {
                const user = await User.findOne({ name: input.name, familyName: input.familyName });

                if (user) {
                    user.locationHistory.push(...input.locationHistory); // Assuming newLocationHistory is an object of LocationInput

                    await user.save();

                    let users = await User.find({ familyName: input.familyName });
                    users = users.map(user => {
                        if (user.locationHistory && user.locationHistory.length > 0) {
                            user.locationHistory = [user.locationHistory[user.locationHistory.length - 1]];
                        }
                        return user;
                    });
                    pubsub.publish('LOCATION_UPDATED', { locationUpdated: users });

                    return user;
                } else {
                    return {};
                }
            } catch (error) {
                return { success: false, message: 'Failed to add location history' };
            }
        },
        registerUser: async (parent: any, args: any) => {
            const { input } = args;
            console.log(JSON.stringify(input))
            const newUser = new User(input);
            await newUser.save();
            // Step 2: Create corresponding node in Neo4j




            // Example usage
            // await createRecord(input.name, input.relation, input.familyName, input.mobileNumber);



            return true;
        },
        sendOTP: async (parent: any, args: any) => {
            const { mobileNumber } = args;

            return true;
        },
        verifyOTP: async (parent: any, args: any) => {
            const { mobileNumber, otp } = args;

            return true;
        },

        // Implement other mutation resolvers here
    },
    Subscription: {
        locationUpdated: {
            subscribe: () => {
                console.log("Subscription called");
                return pubsub.asyncIterator('LOCATION_UPDATED');
            },
        },
    },
};

export default resolvers;
