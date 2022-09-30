import express , {Request , Response} from 'express'
const router = express.Router();
import {NotFoundError , validateRequest , NotAuthorizedError , requireAuth, BadRequestError} from '@karimtickets/common'
import {Ticket} from '../models/ticket'
import {TicketUpdatedPublisher} from '../events/publishers/ticket-updated-publisher'
import {natsWrapper} from '../nats-wrapper'
import {body} from 'express-validator'

router.put('/api/tickets/:id',
requireAuth,
[
    // handle case that title is not provided or empty title
    body('title').not().isEmpty().withMessage('Title is required'), //message if the check is failed
    body('price').isFloat({ gt : 0}).withMessage('price must be greater than zero') //message if the check is failed
],
 validateRequest ,
 async(req: Request , res :Response)=>{
    const ticket = await Ticket.findById(req.params.id)

    if(!ticket){
        throw new NotFoundError()
    }
    if(ticket.orderId){ // refuse to update reserved ticket
        throw new BadRequestError("can not edit a reserved ticket")
    }
    if(ticket.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }
    ticket.set({
        title: req.body.title,
        price: req.body.price
    })
    await ticket.save()
    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })
    res.send(ticket)
})

export {router as updateTicketRouter}