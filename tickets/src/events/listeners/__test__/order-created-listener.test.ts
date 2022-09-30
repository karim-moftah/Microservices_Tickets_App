import {OrderCreatedEvent , OrderStatus} from '@karimtickets/common'
import {natsWrapper} from '../../../nats-wrapper'
import {OrderCreatedListener} from '../order-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async()=>{
    // create an istance of a listener
    const listener = new OrderCreatedListener(natsWrapper.client)
    const ticket = Ticket.build({
        title:'concert',
        price:99,
        userId:'hefwdp'
    })
    await ticket.save()

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version : 0,
        status:OrderStatus.Created,
        expiresAt:'qklf',
        userId: 'ekfh',
        ticket:{
            id:ticket.id,
            price:ticket.price
        }
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener , data ,ticket , msg}
}

it('sets the userId of the ticket',async () => {
    const {listener , ticket , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)

})
it('acks the message',async () => {

    const {listener , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that the ack function was called 
    expect(msg.ack).toHaveBeenCalled()
})
it('publishes a ticket updated event',async () => {

    const {listener , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that the ack function was called 
    expect(natsWrapper.client.publish).toHaveBeenCalled()

    // @ts-ignore
    // console.log(natsWrapper.client.publish.mock.calls)

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(data.id).toEqual(ticketUpdatedData.orderId)
})

