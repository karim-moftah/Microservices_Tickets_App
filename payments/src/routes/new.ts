import express , {Request, Response } from 'express'
const router = express.Router();
import {body} from 'express-validator'
import {requireAuth  ,validateRequest , BadRequestError , NotFoundError , NotAuthorizedError , OrderStatus} from '@karimtickets/common' 
import {Order} from '../models/order'
import {natsWrapper} from '../nats-wrapper'
import {stripe} from '../stripe'
import {Payment} from '../models/payment'
import {PaymentCreatedPublisher} from '../events/publishers/payment-created-publisher'

router.post('/api/payments',
requireAuth, //make sure that currentUser is defined in the req.body
[
    // handle case that title is not provided or empty title
    body('token').not().isEmpty().withMessage('Token is required'), //message if the check is failed
    body('orderId').not().isEmpty().withMessage('orderId is required'), //message if the check is failed
],
 validateRequest ,
 async(req: Request , res :Response)=>{
    const { token , orderId} = req.body
    const order = await Order.findById(orderId)
    if(!order){
        throw new NotFoundError()
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }
    if(order.status === OrderStatus.Cancelled){
        throw new BadRequestError("can not pay for cancelled order")
    }

    const charge = await stripe.charges.create({
        currency:'usd',
        amount: order.price * 100, //    cent * 100 = usd
        source: token
    })
    const payment = Payment.build({
        orderId,
        stripeId: charge.id
    })
    await payment.save()
     new PaymentCreatedPublisher(natsWrapper.client).publish({ //await
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    })
    res.status(201).send({id:payment.id})
})

export {router as createChargeRouter}