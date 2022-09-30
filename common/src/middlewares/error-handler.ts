import express , {Request , Response , NextFunction} from 'express'
import {CustomError} from '../errors/custom-error'

export const errorHandler = (
    err : Error,
    req : Request,
    res : Response,
    next : NextFunction
) =>{

// console.log('Something went wrong' , err.message);

if(err instanceof CustomError){
    console.log('handling this error as request validation error');

    return res.status(err.statusCode).send({errors : err.serializeErrors()});
    
}
    console.error(err)
    res.status(400).send({
        errors : [{
            message : 'Something went wrong'
        }]
    });

}

