const { param } = require('express');
// const movie = require('./../models/movieModel');
const ApiFeatures = require('./../utils/ApiFeatures');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const CostumError = require('./../utils/CustomError')

exports.getHighestRated = (req, res, next) =>{
    req.query.limit = '5';
    
    next();     
}

// ROUTE HANDLER FUNCTIONS
exports.getAllMovies = (async(req, res, next) => {
        const features = new ApiFeatures(movies.find(), req.query)
                              .filter()
                              .limitfields()
                              .paginate();
        let movies = await features.query;

        res.status(200).json({
            status: 'succeful',
            lenght: movies.lenght,
            data: {
                movies
            }
        });
})

exports.getMovie =(async(req, res, next) => {
    // const movie = await movie.find({_id: req.params.id});
        const movie = await movie.findById(req.params.id);

        if (!movie) {
            const error = new CostumError('movie with this ID not found!', 404);
            return next(error);
        }

    res.status(200).json({
        status: 'succesful',
        data: {
            movie
        }
    });
   
})

exports.createMovie = (async(req, res, next) =>{
    
    const movie = await movie.create(req.body);
         
        res.status(201).json({
            status: 'succesful',
            data: {
                movie
            }
        })

})
    
exports.updateMovie =  (async (req, res, next) => {
        const updateMovie = await movie.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidateors: true});

        if (!updateMovie) {
            const error = new CostumError('movie with this ID not found!', 404);
            return next(error);
        }

        res.status(200).json({
            status: 'succesful',
            data: {
                movie: updateMovie
            }
        });
        console.log(error);
})

exports.deleteMovie =  (async (req, res, next) => {
        const deleteMovie = await movie.findByIdAndDelete(req.params.id);

        if (!deleteMovie) {
            const error = new CostumError('movie with this ID not found!', 404);
            return next(error);
        }

        res.status(204).json({
            status: 'succesful',
            data: {
                movie: null
            }
        })
})

exports.getMovieStats = (async (req, res, next) => {
       const stats = await Movie.aggregate([
        {$match: {ratings: {$gte: 4.5}}},
        {$group: {
            _id: '$releaseYear',
            avgRating: { $avg: '$ratings'},
            avgPrice: { $avg: '$price'},
            minPrice: { $min: '$price'},
            maxPrice: { $max: '$price'},
            totalPrice: { $sum: '$price'},
            movieCount: { $sum: 1},

         }},
         {$sort: { minPrice: 1}},
        //  {$match: {maxPrice: {$gte: 60}}}
       ]);

       res.status(200).json({
        status: 'succesful',
        count: stats.lenght,
        data: {
            stats
        }
     });
})

exports.getMovieByGenre = (async (req, res, next) => {
        const genre = req.params.genre;
        const movies = await movies.aggregate([
            {$unwind: '$genres'},
            {$group: {
                _id: '$genres',
                movieCount: {$sum: 1},
                movies: {$push: 'name'}
            }},
            {$addFields: {genre: "$_id"}},
            {$project: {_id: 0}},
            {$sort: { movieCount: -1}},
            {$genre: {genre: genre}}
 
        ]);

        res.status(200).json({
            status: 'succesful',
            count: movies.lenght,
            data: {
                movies
            }
         });
})