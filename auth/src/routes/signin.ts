import express , {Request , Response , NextFunction} from 'express'
const router = express.Router();
import {User} from '../models/users'
const { body, validationResult } = require('express-validator');
import { validateRequest, BadRequestError } from '@karimtickets/common';
import {Password} from '../services/password'
import jwt from 'jsonwebtoken'

router.post('/api/users/signin', 
[
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must supply a valid password')



]
,
validateRequest,
async(req : Request , res : Response)=>{
    const {email , password} = req.body;
    const existingUser = await User.findOne({ email });
    if(!existingUser){
        throw new BadRequestError('Invalid credentials')
    }
    console.log('passed exist user')
    const passwordsMatch = await Password.compare(existingUser.password , password)
    if(!passwordsMatch){
        throw new BadRequestError('Invalid credentials')
    }
    console.log('passed pass match')
    //Generate JWT
    const userJwt = jwt.sign({
        id : existingUser.id,
        email : existingUser.email
    }, process.env.JWT_KEY!)

    // req.session = {
    //     jwt : userJwt
    // }
    req.session!['jwt'] = userJwt;
    res.status(200).send(existingUser)
})

export {router as signinRouter}