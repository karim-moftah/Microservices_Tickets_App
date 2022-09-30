import { OrderStatus , ExpirationCompleteEvent} from '@karimtickets/common'
import {natsWrapper} from '../../../nats-wrapper'
import {ExpirationCompleteListener} from '../expiration-complete-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { Order } from '../../../models/order'

const setup = async()=>{
    // create an istance of a listener
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    })
    await ticket.save()

    const order = Order.build({
        status:OrderStatus.Created,
        userId:'lwjfw',
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId:order.id,
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener , order, ticket, data , msg}
}

it('updates the order status to cancelled',async () => {
    const {listener ,order, ticket, data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that a ticket was created
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event',async () => {

    const {listener ,order, data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    //write assertion to make sure that the ack function was called 
    expect(eventData.id).toEqual(order.id)
})

it('acks the message',async () => {

    const {listener , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that the ack function was called 
    expect(msg.ack).toHaveBeenCalled()
})
