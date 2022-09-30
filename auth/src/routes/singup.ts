import express , {Request , Response , NextFunction} from 'express'
const router = express.Router();
import {User} from '../models/users'
const { body, validationResult } = require('express-validator');
import  {BadRequestError , validateRequest}   from '@karimtickets/common'
import jwt from 'jsonwebtoken'


router.post('/api/users/signup',[

    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 5  , max: 20}).withMessage('Password must be between 5 to 20 characters')

],
validateRequest
,async(req : Request , res : Response)=>{
  
    const {email , password} = req.body;
    const existingUser = await User.findOne({ email });
    if(existingUser){
        // console.log('Email in use');
        // return res.send({})
        throw new BadRequestError('Email in use')
    }

    const user = User.build({ email , password });
    await user.save();

    //Generate JWT
    const userJwt = jwt.sign({
        id : user.id,
        email : user.email
    }, process.env.JWT_KEY!)

    // req.session = {
    //     jwt : userJwt
    // }
    req.session!['jwt'] = userJwt;
    res.status(201).send(user)
   
})

export {router as signupRouter}