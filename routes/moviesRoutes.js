const express = require('express');
const moviesControllers = require('./../controllers/moviesControllers');
const authController = require('../controllers/authControllers');

const router = express.Router();

const moviesRouter = express.Router();

// router.param('id', moviesControllers.checkId)

router.route('/highest-rated').get(moviesControllers.getHighestRated, moviesControllers.getAllMovies)
router.route('/movie-stats').get(moviesControllers.getMovieStats);
router.route('/movies-by-genre').get(moviesControllers.getMovieByGenre);


moviesRouter.route('/')
    .get(authController.protect, moviesControllers.getAllMovies)
    .post(moviesControllers.createMovie)
    
moviesRouter.route('/:id')
    .get(authController.protect, moviesControllers.getMovie)
    .patch(moviesControllers.updateMovie)
    .delete(authController.protect, authController.restrict('admin'), moviesControllers.deleteMovie)

module.exports = router;    