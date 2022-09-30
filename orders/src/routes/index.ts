import express , {Request , Response} from 'express'
const router = express.Router();
import {Order} from '../models/order'
import {requireAuth} from '@karimtickets/common' 

router.get('/api/orders',
requireAuth,
 async(req: Request , res :Response)=>{
    const orders = await Order.find({
        userId: req.currentUser!.id
    }).populate('ticket')// get the order and the associated ticket
    
    res.send(orders)
})

export {router as indexOrderRouter}