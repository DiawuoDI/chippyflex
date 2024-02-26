// const {application} = require('express');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const moviesRouter = require('./routes/moviesRoutes');
const authRouter = require('./routes/authRouter');
const CustomError = require('./utils/CustomError');
const golbalErrorHandler = require('./controllers/errorController')
const userRouter = require('./routes/userRoute');

let app = express();

app.use(helmet());
let limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 *1000,
    message: 'We have recieved too many request from this page. Please try after one hour.'
});

app.use('/api', limiter);

app.use(express.json({limit: '10kb'}));
// if(process.env.NODE_ENV==='development'){
//     app.use(morgan('dev'))
// }
app.use(express.static('./public'))
// 

//USING THE ROUTE
app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

app.all('', (req, res, next) => {
// //     // res.status(404).json({
// //     //     status: 'fail',
// //     //     message: "can't find ${req.originalurl} on the server!"
// //     // })
// //     // const err = new Error("can't find ${req.originalurl} on the server!");
// //     // err.status = 'fail';
// //     // err.statusCode = 404;
    const error = new CustomError('cant find ${req.originalUrl} on the server!', 404);
   next(error);
})

// app.use(golbalErrorHandler);

// create a server
// const server = http.createServer((req, res) => {
//     console.log('A new requuest recieved');
// });

// // start the server
module.exports = app;
