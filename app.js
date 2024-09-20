const express = require('express');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const campgroundsRoutes = require('./routes/campgrounds');
const commentsRoutes = require('./routes/comments');
const usersRoutes = require('./routes/users');
const User = require('./models/user');
const ErrorHandler = require('./utils/ErrorHandler');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const app = express();
const dbUrl = process.env.DBURL;


app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "https://api.maptiler.com",
            "https://unpkg.com",
            "https://code.jquery.com",
            "https://cdnjs.cloudflare.com",
            "https://stackpath.bootstrapcdn.com",
            "https://cdn.jsdelivr.net",
            "'unsafe-inline'"
        ],
        styleSrc: [
            "'self'",
            "https://stackpath.bootstrapcdn.com",
            "https://cdn.jsdelivr.net",
            "https://unpkg.com",
            "'unsafe-inline'"
        ],
        imgSrc: [
            "'self'",
            "https://res.cloudinary.com",
            "https://api.maptiler.com",
            "https://cdn.jsdelivr.net",
            "https://unpkg.com",
            "data:" // Allow data URLs
        ],
        connectSrc: ["'self'"],
    },
}));

// 解析请求体中的数据
app.use(express.urlencoded({ extended: true }));

// 连接到 MongoDB 数据库
mongoose.connect(dbUrl, {
})
.then(() => {
    console.log('Connected to MongoDB Atlas!');
})
.catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

// 提供静态文件
app.use(express.static('public'));

// 设置模板引擎为 EJS
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// 允许使用 PUT 和 DELETE 方法
app.use(methodOverride('_method'));


app.use(mongoSanitize());

// 设置Session
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.DBURL, 
        touchAfter: 24 * 3600 // Session数据每24小时更新一次
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // 设置Cookie过期时间为1天
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 中间件：设置 res.locals
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user; // req.user 是由 passport 提供的
    next();
});

// 处理主页
app.get('/', (req, res) => {
    res.redirect('homepage');
});

// 主页路由
app.get('/homepage', (req, res) => {
    res.render('homepage');
});

// 使用 campgrounds 路由
app.use('/campgrounds', campgroundsRoutes);

// 使用评论路由
app.use('/campgrounds/:id/comments', commentsRoutes);

// 使用用户路由
app.use('/', usersRoutes);

// 处理 404 错误
app.use((req, res, next) => {
    next(new ErrorHandler("Page Not Found", 404));
});

// 错误处理 middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong!' } = err;
    res.status(statusCode).render('error', { err: { message, statusCode } });
});

// 启动服务器
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});