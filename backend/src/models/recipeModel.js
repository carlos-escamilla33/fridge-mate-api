const {pool} = require("../config/database");

const createRecipe = async ({account_id, recipe_name, ingredients, instructions, based_on_items}) =>{
    try {
        const {rows: [recipe]} = await pool.query(
            `
            INSERT INTO recipe(account_id, recipe_name, ingredients, instructions, based_on_items)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *; 
            `,
            [account_id, recipe_name, ingredients, instructions, based_on_items]
        );

        return recipe;
    } catch (err) {
        throw err;
    }
}

const findRecipeById = async (id) => {
    try {
        const {rows: [recipe]} = await pool.query(
            `
            SELECT * FROM recipe
            WHERE recipe_id=$1;
            `,
            [id]
        );

        return recipe;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createRecipe,
    findRecipeById,
    
}