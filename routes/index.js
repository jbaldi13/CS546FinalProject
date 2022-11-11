const userRoutes = require("./users");
const path = require("path");

const constructorMethod = (app) => {
    // Get homepage
    app.get('/', (req, res) => {
        res.sendFile(path.resolve('static/homepage.html'));
    });

    app.use('/users', userRoutes);

    app.use('*', (req, res) => {
        res.status(404).render('errors/pageNotFound', {title : "Not Found", error : "Page Not Found"});
    });
};

module.exports = constructorMethod;