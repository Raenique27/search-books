const {User} = require("../models");
const {AuthenticationError} = require("apollo-server-express");
const {signToken} = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({_id: context.user._id})
                    .select("-__v -password")
                    .populate("savedBooks");

                return userData;
            }
            throw new AuthenticationError("Not logged in");
        },
    },

    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError("Incorrect crendentials");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError("Incorrect crendentials");
            }

            const token = signToken(user);

            return {token, user};
        },

        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username, email, password})
            const token = signToken(user);

            return {token, user};
        },
    }
}