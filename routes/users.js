const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// 注册路由
router.get('/register', (req, res) => {
    res.render('authentications/register');
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/campgrounds'); // 注册成功后重定向到 /campgrounds
        });
    } catch (e) {
        req.flash('error', '注册失败');
        res.redirect('/register'); // 注册失败后重定向回 /register
    }
});

// 登录路由
router.get('/login', (req, res) => {
    res.render('authentications/login');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res) => {
    res.redirect('/campgrounds'); // 登录成功后重定向到 /campgrounds
});

// 注销路由
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', '已成功登出');
        res.redirect('/login'); // 注销后重定向到 /login
    });
});

module.exports = router;