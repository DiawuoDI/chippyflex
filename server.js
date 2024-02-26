const mongoose =require('mongoose');
const dotenv =require('dotenv');
dotenv.config({path: './config.env'})

// process.on('uncaughtException', (err) => {
//     console.log(err.name, err.message);
//     console.log('uncaught Exception occured!');
//         process.exit(1);
//     })

const app = require('./app');

// console.log(app.get('env'));
console.log(process.env);

// mongoose.connect(process.env.DB_CONN_STR ,{
//     useNewurlParser: true
// }).then((conn) => {
    console.log('DB connection succeful');
// })


const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
    console.log('server has started...');
})

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured!');

    Server.class(() => {
        process.exit(1);
    })
})

