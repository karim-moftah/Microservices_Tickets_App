import express , {Request , Response} from 'express'
const router = express.Router();
import {Order} from '../models/order'
import {requireAuth , NotAuthorizedError , NotFoundError} from '@karimtickets/common' 


router.get('/api/orders/:orderId',requireAuth,
 async(req: Request , res :Response)=>{
    const order = await Order.findById(req.params.orderId).populate('ticket')// get the order and the associated ticket
    if(!order){
        throw new NotFoundError()
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }
    res.send(order)
})

export {router as showOrderRouter}