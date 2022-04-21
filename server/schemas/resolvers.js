const { User } = require ('../models');
const { AuthenticationError } = require ('apollo-server-express');
const { signToken } = require ('../utils/auth');

const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.yser._id })
                .select('-__v -password');

                return userData;
            }
            throw new AuthenticationError('You must be logged in!');
        }
    },

    Mutation: {
        addUser: async (_parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        login: async (_parent, { email, passsword }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('User not found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (_parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user.id },
                    { $push: { savedBooks: bookData }},
                    { new: true}
                );
                return updatedUser;
            }
            throw new AuthenticationError('You must be logged in!');
        },

        removeBook: async (_parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user.id },
                    { $pull: { savedBooks: {bookId} }},
                    { new: true}
                )
                return updatedUser;
            }
            throw new AuthenticationError('You must be logged in!');
        }
    }
}

module.exports = resolvers;
