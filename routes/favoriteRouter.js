const express = require('express');
const favoriteRouter = express.Router();
const cors = require('./cors');
const authenticate = require('./authenticate');
const Favorite = require('../models/favorite');

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then((favorites) => {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      })
      .catch(next);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((campsite) => {
            if (!favorite.campsites.includes(campsite._id)) {
              favorite.campsites.push(campsite._id);
            }
          });
          favorite
            .save()
            .then((favorite) => {
              res.status(200);
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(next);
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then((favorite) => {
              res.status(200);
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(next);
        }
      })
      .catch(next);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        } else {
          res.status(200);
          res.setHeader('Content-Type', 'text/plain');
          res.end('You do not have any favorites to delete.');
        }
      })
      .catch(next);
  });

favoriteRouter
  .route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
            favorite
              .save()
              .then((favorite) => {
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              })
              .catch(next);
          } else {
            res.status(200);
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is already in the list of favorites!');
          }
        } else {
          Favorite.create({
            user: req.user._id,
            campsites: [req.params.campsiteId],
          })
            .then((favorite) => {
              res.status(200);
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(next);
        }
      })
      .catch(next);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          const index = favorite.campsites.indexOf(req.params.campsiteId);
          if (index >= 0) {
            favorite.campsites.splice(index, 1);
            favorite
              .save()
              .then((favorite) => {
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              })
              .catch(next);
          } else {
            res.status(200);
            res.setHeader('Content-Type', 'text/plain');
            res.end('No favorites to delete for this campsite.');
          }
        } else {
          res.status(200);
          res.setHeader('Content-Type', 'text/plain');
          res.end('You do not have any favorites to delete.');
        }
      })
      .catch(next);
  });

module.exports = favoriteRouter;
