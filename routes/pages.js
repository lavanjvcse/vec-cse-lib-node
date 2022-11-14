const express = require("express");
const router = express.Router();
const userContoller = require("../controllers/users");
router.get("/",(req,res) => {
   
    res.render("index");

});
router.get("/register",(req,res) => {
   
    res.render("register");

});

// router.get("/forgot",(req,res) => {
   
//     res.render("forgot");

// });
router.get("/profile", userContoller.isLoggedIn, (req,res) => {
   
    if (req.user) {
        res.render("profile", { user: req.user });
      } else {
    res.render("./");
      }
});
router.get("/home", userContoller.isLoggedIn, (req,res) => {
   
    if (req.user) {
        res.render("home", { user: req.user });
      } else {
    res.render("./");
      }

});
router.get("/slideshare", userContoller.isLoggedIn, (req,res) => {
   
    if (req.user) {
        res.render("slideshare", { user: req.user });
      } else {
    res.render("./");
      }

});
router.get("/displayBooks", userContoller.isLoggedIn, (req,res) => {
    if (req.user) {
        res.render("displayBooks", { user: req.user });
      } else {
    res.render("./");
      }

});

module.exports = router;