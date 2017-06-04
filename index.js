// @flow

const express = require('express');
const app = express();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

require('dotenv').config();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_REDIRECT_URL
}, (accessToken, refreshToken, profile, done) => {
    console.log(accessToken, refreshToken, profile, done);
}));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.send('hello world')
});

app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/error' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
});

app.listen(3000);
