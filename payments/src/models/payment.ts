import mongoose from 'mongoose'



// An interface that discibes the properties that are required to create a new Payment

interface PaymentAttrs{
    orderId : string,
    stripeId: string,

}

// An interface that discibes the properties that a Payment document has
// to have possibility to add addition properties in the future
interface PaymentDoc extends mongoose.Document{
    orderId : string,
    stripeId: string,
}


// An interface that discibes the properties that a Payment model has
interface PaymentModel extends mongoose.Model<PaymentDoc>{
    build(attrs :  PaymentAttrs) : PaymentDoc
}


const paymentSchema = new mongoose.Schema(
    {

        orderId : {
            type: String,
            required : true
        },
        stripeId : {
            type: String,
            required : true,
        },

    },
    
    {
        toJSON: {
            transform(doc , ret){
                ret.id = ret._id
                delete ret._id
            }
        }
        
    })


// check validation on properties to create a new record
paymentSchema.statics.build = (attrs : PaymentAttrs) =>{
    return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc , PaymentModel>('Payment' ,paymentSchema);


export { Payment };
