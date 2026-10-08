const router = require("express").Router();
const passport = require("passport");
const CLIENT_URL = "http://localhost:3000/";

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "failure",
    });
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect(CLIENT_URL);
});

router.get("/google", passport.authenticate("google",
    {scope: ["profile", "email"]}
));

router.get(
    "/google/callback",
    passport.authenticate('google', {
        successRedirect: "http://localhost:3001/user/login/success",
        failureRedirect: "https://www.abola.pt/",
    })
);

router.get("/github", passport.authenticate("github", {scope: ["profile", 'user:email']}));

router.get(
    "/github/callback",
    passport.authenticate("github", {
        successRedirect: "http://localhost:3001/user/login/success",
        //Não funciona tal como no google
        failureRedirect: "https://www.abola.pt/",
    })
);

module.exports = router