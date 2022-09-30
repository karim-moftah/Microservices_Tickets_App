import {OrderCancelledEvent , OrderStatus} from '@karimtickets/common'
import {natsWrapper} from '../../../nats-wrapper'
import {OrderCancelledListener} from '../order-cancelled-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'


const setup = async()=>{
    // create an istance of a listener
    const listener = new OrderCancelledListener(natsWrapper.client)
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version : 0,
        userId:'grgrh',
        price:10,
        status: OrderStatus.Created,
    })
    await order.save()

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id:order.id,
        version : 1,
        ticket:{
            id:'qfqfe',
        }
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener , data , msg , order}
}

it('updates the status of the order',async () => {
    const {listener , data , msg , order} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that a ticket was created
    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message',async () => {

    const {listener , data , msg , order} = await setup()

    // call the onMessage function with the data object + msg object 
    await listener.onMessage(data,msg)

    //write assertion to make sure that the ack function was called 
    expect(msg.ack).toHaveBeenCalled()
})
