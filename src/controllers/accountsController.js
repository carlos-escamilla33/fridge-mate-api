const {findAccountByCode} = require("../database/models/accountModel");
const {createProfile, findProfileByName} = require("../database/models/profileModel");

const registerProfile = async (req, res, next) => {
    const {id} = req.user;
    const {first_name, last_name} = req.body;
    try {
        if (!first_name || !last_name) {
            return res.status(400).json({ 
                message: "First name and last name are required" 
            });
        }
        
        const _profile = await findProfileByName(id, first_name, last_name);

        if (_profile) {
            return res.status(400).json({ 
                message: "Profile with this name already exists" 
            });
        }
        
        const profile = await createProfile(id, first_name, last_name);
        
        res.send({
            message: "Profile successfully created!",
            profile,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    registerProfile
}