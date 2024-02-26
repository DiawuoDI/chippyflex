const CustomError = require("../utils/CustomError");

const devErrors = (res,error) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}

const castErrorHandler = (err) => {
    const msg = 'invalid value  for ${error.path}: ${error.value}!';
    return new CustomError(msg, 400);
}

const duplicateKeyErrorHandler = (err) => {
const name = error.keyValue.name;
const msg = 'There is already a movie with name ${name} Please use another name!';
    return new CustomError(msg, 400)
}

const validationErroHandler = (err) => {
 const errors = Object.values(err.errors).map(val => val.message);
 const errorMessage = errors.join('. ');
 const msg = 'Invalid input data: ${errorMessages}';

 return new CustomError(msg, 400);
}

const handleExpiredJWT = (err) => {
    return new CustomError('JWT has expired. Please login again!', 401)
}

const prodErrors = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    }else {
        res.status(500).json({
            status: "error",
            message: 'Something went wrong please try again later'
        });
    } 
}
   

exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status|| 'error';

    if (process.env.NODE_ENV === 'development') {
         devErrors(res, error)
    }else if (process.env.NODE_ENV === 'production') {
      if (error.name === 'CastError') error = castErrorHandler(error);
      if(error.code === 11000) error = duplicateKeyErrorHandler(error);
      if(error.name === 'ValidationError') error = validationErroHandler(error);
      if(error.name === 'TokenExpiredError') error = handleExpiredJWT(error);
      
       prodErrors(res, error)
   }

}