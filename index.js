// @flow

const express = require('express');
const app = express();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const _ = require('lodash');
const session = require('express-session')

require('dotenv').config();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_REDIRECT_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, _.get(profile, ['emails', '0', 'value']));
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get('/', (req, res) => {
    res.send('hello world')
});

app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/error' }), (req, res) => {
    // Successful authentication, redirect home.
    // res.redirect('/');
    console.log(req.user);
    res.send('hello, ' + req.user);
});

app.listen(3000);
