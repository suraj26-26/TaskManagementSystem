const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if(existingUser) {
            return res.status(400).send('Username Already taken');
        }
        const user = new User({ username, password });
        await user.save();
        req.session.userId = user._id;
        await req.session.save();
        res.status(201).send('User registered successsfully');
        alert('User Registered Successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if(!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid Credentials');
        }
        req.session.userId = user._id;
        await req.session.save();
        res.status(200).send('Login Successful');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        
        res.redirect('/login?loggedOut=true');
    });
});

module.exports = router;