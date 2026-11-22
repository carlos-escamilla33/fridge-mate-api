const app = require('./app');
const {runMigrations} = require('./src/database/migrations');
const PORT = process.env.PORT || 3001;

runMigrations()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Migrations failed, not starting server:", err);
        process.exit(1);
    });
// server -> api -> route -> route action -> route controller
