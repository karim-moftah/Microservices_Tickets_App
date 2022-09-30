import {OrderCancelledEvent , OrderStatus} from '@karimtickets/common'
import {natsWrapper} from '../../../nats-wrapper'
import {OrderCancelledListener} from '../order-cancelled-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async()=>{
    // create an istance of a listener
    const orderId = new mongoose.Types.ObjectId().toHexString()
    const listener = new OrderCancelledListener(natsWrapper.client)
    const ticket = Ticket.build({
        title:'concert',
        price:20,
        userId:'hefwdp'
    })
    await ticket.save()

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version : 0,
        ticket:{
            id:ticket.id,
        }
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener , data ,ticket , msg , orderId}
}

it('updates a ticket, publishes an event and acks a message',async () => {
    const {listener , ticket , data , msg , orderId} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled()

})


