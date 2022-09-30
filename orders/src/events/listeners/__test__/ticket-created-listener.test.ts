import {TicketCreatedEvent} from '@karimtickets/common'
import {natsWrapper} from '../../../nats-wrapper'
import {TicketCreatedListener} from '../ticket-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = ()=>{
    // create an istance of a listener
    const listener = new TicketCreatedListener(natsWrapper.client)

    // create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version : 0,
        title:'concert',
        price:10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener , data , msg}
}

it('creates and saves a ticket',async () => {
    const {listener , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that a ticket was created
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
})
it('acks the message',async () => {

    const {listener , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that the ack function was called 
    expect(msg.ack).toHaveBeenCalled()
})
