import {TicketUpdatedEvent} from '@karimtickets/common'
import {natsWrapper} from '../../../nats-wrapper'
import {TicketUpdatedListener} from '../ticket-updated-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup =async ()=>{
    // create an istance of a listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    })
    await ticket.save()

    // create a fake data object
    const data:TicketUpdatedEvent['data'] = {
        id:ticket.id,
        version: ticket.version +1,
        title:'newConcert',
        price:999,
        userId:'kwehf'
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {msg , data ,ticket , listener}
}

it('finds , updates and saves a ticket',async () => {
    const {msg , data ,ticket , listener} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id)

    
    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message',async () => {

    const {msg , data , listener} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that the ack function was called 
    expect(msg.ack).toHaveBeenCalled()
})

it('does not call the ack function if the event has a skipped version number',async () => {

    const {msg , data , listener} = await setup()
    data.version = 10

    // call the onMessage function with the data object + msg object 
   try{
    await listener.onMessage(data,msg)
   } catch(err){

   }
    //write assertion to make sure that the ack function not called 
    expect(msg.ack).not.toHaveBeenCalled()
})
