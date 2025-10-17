const {createProfile, findProfileByName, findProfilesByAccountId} = require("../database/models/profileModel");
const {findAccountById} = require("../database/models/accountModel");

const registerProfile = async (req, res, next) => {
    const {id} = req.user;
    const {first_name, last_name} = req.body;
    try {
        if (!first_name || !last_name) {
            return res.sendStatus(400);
        }
        
        const _profile = await findProfileByName(id, first_name, last_name);

        if (_profile) {
            return res.sendStatus(400);
        }

        const profile = await createProfile(id, first_name, last_name);
        
        return res.send({
            message: "Profile successfully created!",
            profile,
        });
    } catch (err) {
        next(err);
    }
}

const getAllAccountProfileInfo = async (req, res, next) => {
    const {id} = req.user;
    try {
        const account = await findAccountById(id);
        const profiles = await findProfilesByAccountId(id);

        if (!account || !profiles) {
            return res.sendStatus(400);
        }

       return res.send({
        account: {
            id: account.account_id,
            email: account.email,
            createdAt: account.created_at
        },
        profiles: profiles.map(profile => ({
            id: profile.profile_id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            notificationsEnabled: profile.notifications_enabled
        }))
       });

    } catch (err) {
        next(err);
    }
}


module.exports = {
    registerProfile,
    getAllAccountProfileInfo
}