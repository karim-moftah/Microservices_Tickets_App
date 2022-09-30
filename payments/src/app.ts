import express , {Request , Response , NextFunction} from 'express'
const app = express();
require('express-async-errors');
import {createChargeRouter} from './routes/new'
import {errorHandler , NotFoundError , currentUser} from '@karimtickets/common' 
import cookieSession from 'cookie-session'

app.set('trust proxy' , true)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
    signed : false,
    //secure:true,

}))

app.use(currentUser)
app.use(createChargeRouter)

app.all('*' ,async (req : Request , res  : Response, next : NextFunction) =>{
   throw new NotFoundError();
})
app.use(errorHandler);

export {app}