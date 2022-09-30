import request from 'supertest'
import {app} from '../../app'

const creatTicket = () => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title : 'TicketTitle',
        price : 10
    })
}


it('can fetch a list of tickets' , async () => {
    await creatTicket()
    await creatTicket()
    await creatTicket()

    const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)
    expect(response.body.length).toEqual(3)
})