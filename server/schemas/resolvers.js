const { User } = require ('../models');
const { AuthenticationError } = require ('apollo-server-express');
const { signToken } = require ('../utils/auth');

const resolvers = {
    Query: {
       me: async (parent, args, context) => {
           if(context.user) {
               const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')

                return userData;
           }
           throw new AuthenticationError('You are not logged in!')
       },
       user: async (parent, { username}) => {
           return User.findOne({ username })
            .select('-__v -password')
       },
    },

    Mutation: {
        addUser: async (_parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('User not found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect input!');
            }

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );

                return updatedUser
            }
            throw new AuthenticationError('You need to be logged in!')
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true } 
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in! ')
        }
    }
}

module.exports = resolvers;
