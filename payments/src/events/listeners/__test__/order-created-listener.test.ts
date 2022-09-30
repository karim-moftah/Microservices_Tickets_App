import {OrderCreatedEvent , OrderStatus} from '@karimtickets/common'
import {natsWrapper} from '../../../nats-wrapper'
import {OrderCreatedListener} from '../order-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'


const setup = ()=>{
    // create an istance of a listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version : 0,
        userId:'conklwcert',
        expiresAt:'klwewf',
        status: OrderStatus.Created,
        ticket:{
            id:'qfqfe',
            price:10,
        }
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener , data , msg}
}

it('replicates the order info',async () => {
    const {listener , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that a ticket was created
    const order = await Order.findById(data.id)

    expect(order!.price).toEqual(data.ticket.price)
})
it('acks the message',async () => {

    const {listener , data , msg} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that the ack function was called 
    expect(msg.ack).toHaveBeenCalled()
})
