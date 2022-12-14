const { Authenticate } = require('../models');
const passport = require('passport');  // authentication

//passport.use(Authenticate.createStrategy());

const attemptLogin = (req, res) => {
    passport.authenticate("local",{
        successRedirect: "/secret",
        failureRedirect: "/login"
})};

const loadRegistration = (req, res) => {
    res.render('../public/signup.ejs')
};

const registerUser = async (req, res) => {
    const payload = req.body;

    if (!payload) {
        return res.status(400).json({
            success: false,
            error: "Must include destination",
        });
    };

    const authentication = Authenticate.register({username: payload.username, email: payload.email}, payload.password);

    if (!authentication) {
        return res.status(400).json({
            success: false,
            error: "User not created",
        });
    };

    await authentication
        .then(() => {
            passport.authenticate("local")(req, res, () => {
                return res.redirect('/');
            })
            })
        .catch((e) => {
            return res.status(400).json({
                e,
                message: "User not created"
            })
        })
}

const logoutUser = (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
    });
};

const getProfile = (req, res) => {
    res.render('../public/profile.ejs');
}

const deleteProfile = (req, res) => {

}

const getUsers = async (req, res) => {
    await Authenticate.find({}, (error, destination) => {
        if (error) {
          return res.status(400).json({
            error,
            success: false,
          });
        }
    
        return res.status(200).json({
          success: true,
          data: destination,
        });
      })
        .clone()
        .catch((err) => console.log(err));
}

// To use with sessions
passport.serializeUser(Authenticate.serializeUser());
passport.deserializeUser(Authenticate.deserializeUser());

module.exports = {
    attemptLogin,
    loadRegistration,
    registerUser,
    logoutUser,
    getUsers,
    getProfile,
    deleteProfile
}