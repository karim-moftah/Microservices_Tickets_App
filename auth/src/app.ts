import express , {Request , Response , NextFunction} from 'express'
const app = express();
require('express-async-errors');

import {currentUserRouter } from './routes/current-user'
import {signinRouter } from './routes/signin'
import {signupRouter } from './routes/singup'
import {signoutRouter } from './routes/signout'
import {errorHandler , NotFoundError} from '@karimtickets/common' 
import cookieSession from 'cookie-session'

app.set('trust proxy' , true)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
    signed : false,
    //secure:true,

}))

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signupRouter)
app.use(signoutRouter)
app.all('*' ,async (req , res , next) =>{
   throw new NotFoundError();
})
app.use(errorHandler);

export {app}