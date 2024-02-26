const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const fs = require('fs');
const movie = require('../models/movieModel');

// dotenv.config({path: './config.env'});

// mongoose.connect(process.env.DB_CONN_STR ,{
//     useNewurlParser: true
// }).then((conn) => {
//     console.log('DB connection succeful');
// });

const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));

const deleteMovies = async () => {
    try {
       await movie.deleteMany();
        console.log('Deleted successfully')
    } catch (error) {
        console.log(err.message);
    }
    process.exit();
}

const importMovies = async () => {
    try {
       await movie.create(movies);
        console.log('Imported successfully')
    } catch (error) {
        console.log(err.message);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importMovies();
}

if(process.argv[2] === '--delete'){
    deleteMovies();
}