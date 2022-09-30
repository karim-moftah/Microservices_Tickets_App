import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest'
import { getDefaultLibFileName } from 'typescript';
import jwt from 'jsonwebtoken'

declare global{
  var signin: (id?: string) => string[];
}

// fake nats
jest.mock('../nats-wrapper')

process.env.STRIPE_KEY = 'sk_test_51LnBJyC1eCY3cRm8pSeEHBvzFSuXxIUhYYtTNWT0GKnamOZYWFlbajg7wfKltsgji3cjOmRf704NlK1h622EZN8700kHG19MnH'

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'karim'
    const mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {
  });
});

beforeEach(async () => {
  // make sure to reset data between every test
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
    if (mongo) {
      await mongo.stop();
    }
    await mongoose.connection.close();
  });


global.signin = (id?: string) => {
  // const email = 'test@test.com'
  // const password = 'password'
  // const response = await request(app)
  // .post('/api/users/signup')
  // .send({
  //   email,password
  // })
  // .expect(201)
  // const cookie = response.get('Set-Cookie')
  // return cookie
 


  // build a JWT payload 
  const payload = {
    id : id || new mongoose.Types.ObjectId().toHexString(),
    email : 'test@test.com',
  }

  // create the JWT 
  const token = jwt.sign(payload , process.env.JWT_KEY!)

  // Build session object 
  const session = {jwt : token}

  // trun session into JSON
  const sessionJSON = JSON.stringify(session)

  //Take JSON and encode it into base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // return the string in the cookie with the encoded data

  return [`session=${base64}`];
}