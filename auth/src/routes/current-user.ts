import express , {Request , Response , NextFunction} from 'express'
import {currentUser} from '@karimtickets/common'
// import requireAuth from '../middlewares/require-auth'
const router = express.Router();
import jwt from 'jsonwebtoken'

router.get('/api/users/currentuser',
currentUser,
//requireAuth,
(req , res)=>{
   res.send({currentUser : req.currentUser || null})
})

export {router as currentUserRouter}