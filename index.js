// @flow

const express = require('express');
const app = express();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const _ = require('lodash');
const session = require('express-session')
const Buddybuild = require('buddybuild-client');

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
    const email = _.get(profile, ['emails', '0', 'value']);
    Buddybuild.client(process.env.BUDDYBUILD_API_KEY)
    .addTesters(process.env.BUDDYBUILD_APP_ID, process.env.BUDDYBUILD_DEPLOYMENT_ID, [email])
    .then(() => {
        return done(null, _.get(profile, ['emails', '0', 'value']));
    })
    .catch(err => {
        return done(err, null);
    });
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
    console.log(req.user);
    res.send('hello, ' + req.user);
});

app.listen(3000);
