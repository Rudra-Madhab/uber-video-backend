const userModel = require('../models/user.model');

module.exports.createUser = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        // Validate fields
        if (!firstname || !lastname || !email || !password) {
            throw new Error('All fields are required');
        }

        // Create user
        const user = await userModel.create({
            fullname: {
                firstname,
                lastname
            },
            email,
            password
        });

        return res.status(201).json({
            message: "User created successfully",
            user
        });

    } catch (error) {
        next(error);
    }
};
