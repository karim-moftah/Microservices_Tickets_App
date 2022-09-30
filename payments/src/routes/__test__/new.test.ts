import mongoose from 'mongoose'
import request from 'supertest'
import {app} from '../../app'
import { natsWrapper } from '../../nats-wrapper' //real natswrapper but in setup we redirect in to the fake one
import {Order} from '../../models/order'
import {Payment} from '../../models/payment'
import {OrderStatus} from '@karimtickets/common'
import { stripe } from '../../stripe'

// jest.mock('../../stripe')

it('returns 404 when purchasing an order that does not exist' , async () => {
    const response = await request(app)
    .post('/api/payments')
    .set('Cookie' , global.signin())
    .send({
        token:'lkwhl',
        orderId: new mongoose.Types.ObjectId().toHexString(),
    })
   .expect(404)
})

it('returns 401 when purchasing an order that does not belong to user' , async () => {
    const order = Order.build({
        id : new mongoose.Types.ObjectId().toHexString(),
        price : 10,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    })
    await order.save()

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie' , global.signin())
    .send({
        token:'lkwhl',
        orderId:order.id
    })
   .expect(401)
})

it('returns 400 when purchasing a cancelled order' , async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id : new mongoose.Types.ObjectId().toHexString(),
        price : 10,
        status: OrderStatus.Cancelled,
        userId,
        version: 0
    })
    await order.save()
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token:'lkwhl',
        orderId:order.id
    })
    .expect(400)
})

it('returns 201 with valid input' , async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const price = Math.floor(Math.random() * 100000)
    const order = Order.build({
        id : new mongoose.Types.ObjectId().toHexString(),
        price ,
        status: OrderStatus.Created,
        userId,
        version: 0
    })
    await order.save()
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token:'tok_visa',
        orderId:order.id
    })
    .expect(201)
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][1]
    // expect(chargeOptions.source).toEqual('tok_visa')
    // expect(chargeOptions.amount).toEqual(20 * 100)
    // expect(chargeOptions.currency).toEqual('usd')

    const stripeCharges = await stripe.charges.list({ limit: 50})
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    })
    expect(stripeCharge).toBeDefined()
    expect(stripeCharge!.currency).toEqual('usd')

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    })
    expect(payment).not.toBeNull()
})

