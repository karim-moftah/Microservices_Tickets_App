import express , {Request , Response} from 'express'
const router = express.Router();
import {Ticket} from '../models/ticket'

router.get('/api/tickets',
 async(req: Request , res :Response)=>{
    const ticket = await Ticket.find({
        orderId:undefined
    })
    res.send(ticket)
})

export {router as indexTicketRouter}