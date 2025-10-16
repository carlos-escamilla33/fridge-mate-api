const {findAccountByCode} = require("../database/models/accountModel");
const {createProfile, findProfileByName} = require("../database/models/profileModel");

const registerProfile = async (req, res, next) => {
    const {id} = req.user;
    const {first_name, last_name} = req.body;
    try {
        // check to see if the profile is already in the account
        // if the first name or last name are empty we throw an error
        // if its not in the account already we can create it
        // sign a token and refresh token back to the person creating the profile
    } catch (err) {
        next(err);
    }
}

module.exports = {
    registerProfile
}