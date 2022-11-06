const usersRoutes = require("./users");

const constructorMethod = (app) => {
    //app.use('/users', usersRoutes);
    app.use('/', usersRoutes);

    app.use('*', (req, res) => {
        res.status(404).render('pageNotFound', {title : "Not Found", error : "Page Not Found"});
    });
};

module.exports = constructorMethod;