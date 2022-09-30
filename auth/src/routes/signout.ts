import express , {Request , Response , NextFunction} from 'express'
const router = express.Router();

router.post('/api/users/signout', (req , res)=>{
    req.session = null;
    res.send({})
})

export {router as signoutRouter}