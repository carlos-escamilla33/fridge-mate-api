const bcrypt = require("bcrypt");

const hashPasswordHelper = async (password) => {
  const SALT_COUNT = 10;
  const cryptedPass = await bcrypt.hash(password, SALT_COUNT);
  return cryptedPass;
}

module.exports = {
    hashPasswordHelper,
}