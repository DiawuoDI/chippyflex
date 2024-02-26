const mongoose = require('mongoose');
const {Schema} = mongoose.Schema;
const fs = require('fs');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Name is required!'],
        unique : true,
        maxlenght:[100, 'Not more than 100 characters'],
        minlenght:[4, 'Must have at least 4 characters'],
        trim: true,
        // validate: [validator.isAlpha, "Name should only contain alphabets"],
    },
    description:{
        type: String,
        require:  [true, 'Description is required!'],
        trim: true
    },
    duration: {
        type: Number,
        require: [true, 'Duration is required!']
    },
    ratings: {
        type: Number,
       validate:{ 
           validator: function(value){
               return value >= 1 && value <= 10;
       },
       message: "Rating({VALUE}) should be above 1 and below 10"
    }
    },
    totalRating:{
        type: Number
    },
    releaseYear:{
        type: Number,
        require: [true, 'Release year is required!']
    },
    releaseDate:{
        type: Date
    },
    createdAt:{
        types: Date,
        default: Date.now(),
        Select: false
    },
    genres:{
        type: [String],
        reauired: [true, 'Genres is required!'],
        // enum: {
        //     value:["Action","Adventure","Sci-Fi","Thriller","Crime","Drama","Comedy","Romance","Biography"],
        //     message: "This genre does not exist"
        // }
    },
    directors:{
        type: [String],
        require: [true, 'Directors is required!']
    },
    coverImage:{
        type: String,
        require: [true, 'Cover image is required!']
    },
    actors:{
        type: [String],
        require: [true, 'Actors is required!']
    },
    price:{
        type: String,
        require: [true, 'price is required!']
    },
    createdBy:String
    
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

movieSchema.virtual('durationInHours').get(function(){
    return this.duration / 60
});

// EXECUTE B4 A DOCUMENT IS SAVE IN DB
// .save() or .create()
movieSchema.pre('save', function(next) {
    this.createdBy = 'PARLO';
    console.log(this);
    next();
})

movieSchema.post('save', function(doc, next){
    const content = 'New movie with name ${doc.name} has been created by ${doc.createdBy}\n';
     fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message);
     })
     next();
});

movieSchema.pre(/find/, function(next) {
    this.find({releaseDate: {$lte: Date.now()}});
    this.startTime = Date.now
    next();
})

movieSchema.post(/find/, function(doc, next) {
    this.find({releaseDate: {$lte: Date.now()}});
    this.endTime = Date.now

    const content = 'Query took ${this.endTime * this.startTime} seconds to fetch the docs';
    fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message);
     })

    next();
})

movieSchema.pre('aggregate', function(doc, next){
     console.log(this.pipeline().unshift({$match: {releaseDate: {$lte: new Date()}} }));
     next();
});

const movie = mongoose.model('movie', movieSchema);
module.exports = movie;
