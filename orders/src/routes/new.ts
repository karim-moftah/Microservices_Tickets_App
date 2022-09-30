import express , {Request , Response} from 'express'
const router = express.Router();
import mongoose from 'mongoose';
import {body} from 'express-validator'
import {NotFoundError, requireAuth  ,validateRequest , OrderStatus, BadRequestError} from '@karimtickets/common' 
import {natsWrapper} from '../nats-wrapper'
import {OrderCreatedPublisher} from '../events/publishers/order-created-publisher'
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const EXPIRATION_WINDOW_SECONDS = 1 * 60;
router.post('/api/orders', requireAuth,
[
    body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('ticketId is required'), //message if the check is failed
], 
validateRequest, 
 async(req: Request , res :Response)=>{

    const {ticketId} = req.body
    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)
    if(!ticket){
        throw new NotFoundError()
    }

    //Make sure that this ticket is not reserved
    const isReserved = await ticket.isReserved()
    if(isReserved){
        throw new BadRequestError("Ticket is already reserved")
    }
    

    //calculate an expiration data for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)
    
    // build the order and save it to the database
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    })
    await order.save()
    // Publish an event saying that the order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),    // convert time to UTC
        version:order.version,
        ticket:{
            id: ticket.id,
            price: ticket.price
        }
    })
    res.status(201).send(order)
})

export {router as newOrderRouter}