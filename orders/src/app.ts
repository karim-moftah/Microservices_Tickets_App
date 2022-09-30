import express , {Request , Response , NextFunction} from 'express'
const app = express();
require('express-async-errors');
import {newOrderRouter} from './routes/new'
import {showOrderRouter} from './routes/show'
import {indexOrderRouter} from './routes/index'
import {deleteOrderRouter} from './routes/delete'

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
app.use(newOrderRouter)
app.use(showOrderRouter)
app.use(indexOrderRouter)
app.use(deleteOrderRouter)
app.all('*' ,async (req : Request , res  : Response, next : NextFunction) =>{
   throw new NotFoundError();
})
app.use(errorHandler);

export {app}