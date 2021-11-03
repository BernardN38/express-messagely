const router = require('express').Router()
const { DB_URI } = require('../config')
const User = require('../models/user')
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require('../config')
const JWT_OPTIONS = { expiresIn: 60 * 60 }; 

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req,res,next)=> {
    try {
        const {username, password} = req.body
        let result = await User.authenticate(username,password)
        let token = jwt.sign({username:username}, SECRET_KEY, JWT_OPTIONS )
        return res.json({token});
    } catch (e) {
        next(e)
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
 router.post('/register', async (req,res,next)=> {
    try {
        let result = await User.register(req.body)
        let token = jwt.sign({username:username}, SECRET_KEY, JWT_OPTIONS )
        return res.json({token});
    } catch (e) {
        next(e)
    }
})

module.exports = router;