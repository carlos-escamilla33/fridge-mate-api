const {createProfile, findProfileByName, findProfilesByAccountId} = require("../database/models/profileModel");
const {findAccountById, findAccountByEmail, updateAccountDetails, deleteAccount} = require("../database/models/accountModel");
const {JWT_SECRET, REFRESH_TOKEN_SECRET} = process.env;
const jwt = require("jsonwebtoken");

const registerProfile = async (req, res, next) => {
    try {
        const {id} = req.user;
        const {first_name, last_name} = req.body;

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
    try {
        const {id} = req.user;
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

const updateAccountInfo = async (req, res, next) => {
    try {
        const {id} = req.user;
        const {accountName, newEmail} = req.body;
        const _account = await findAccountById(id);

        if (!_account) {
            return res.sendStatus(400);
        }

        const acc = await findAccountByEmail(newEmail);

        if (acc && acc.account_id !== id) {
            return res.status(400).json({message: "Email already in use"});
        }

        if (!accountName) {
            accountName = _account.account_name;
        }
        if (!newEmail) {
            newEmail = _account.email;
        }

        const account = await updateAccountDetails(id, accountName, newEmail);

        const accessToken = jwt.sign(
            { id: account.account_id, email: newEmail },
            JWT_SECRET,
            { expiresIn: '15m' }
        );
        
        const refreshToken = jwt.sign(
            { id: account.account_id, email: newEmail },
            REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        );

        return res.send({
            message: "Updated account details successfully!",
            account,
            accessToken,
            refreshToken
        });
    } catch (err) {
        next(err);
    }
}

const deleteWholeAccount = async (req, res, next) => {
    try {
        const {id} = req.user;
        const deletedAccount = await deleteAccount(id);

        if (!deletedAccount) {
            return res.status(404).json({ message: "Account not found" });
        }

        return res.send({message: "Account successfully deleted!"});
    } catch (err) {
        next(err);
    }
}


module.exports = {
    registerProfile,
    getAllAccountProfileInfo,
    updateAccountInfo,
    deleteWholeAccount,
}