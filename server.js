const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Person = require('./models.js');

const port = process.env.PORT || 3000;

const app = express();

// error status code constants
const STATUS_SERVER_ERROR = 500;
const STATUS_USER_ERROR = 422;

app.use(bodyParser.json());

// Your API will be built out here.
app.get('/users', (req, res) => {
  Person.find({}, (err, persons) => {
    if (err) {
      res.status(STATUS_SERVER_ERROR)
      res.json({error: 'there was an internal server error'})
      return;
    }
    res.json(persons);
  })
});

app.get('/users/:direction', (req, res) => {
  let { direction } = req.params;
  if (direction === 'asc') direction = 1;
  else if (direction === 'desc') direction === -1;
  else {
    res.status(STATUS_USER_ERROR);
    res.json({error: `please use 'asc' or 'desc' to indicate the sort direction`});
    return;
  }
  Person.find({})
    .sort({lastName: direction})
    .exec((err, persons) => {
      if (err) {
        res.status(STATUS_SERVER_ERROR)
        res.json({error: 'there was an internal server error'})
        return;
      }
      res.json(persons);
    });
});

app.get('/user-get-friends/:id', (req, res) => {
  const { id } = req.params;
  Person.findById(id)
    .select('friends')
    .exec((err, friends) => {
      if (err) {
        res.status(STATUS_SERVER_ERROR)
        res.json({error: 'the id provided did not match any in the db'});
        return;
      }
      res.json(friends);
    })
});


mongoose.Promise = global.Promise;
const connect = mongoose.connect(
  'mongodb://localhost/people',
  { useMongoClient: true }
);
/* eslint no-console: 0 */
connect.then(() => {
  app.listen(port);
  console.log(`Server Listening on ${port}`);
}, (err) => {
  console.log('\n************************');
  console.log("ERROR: Couldn't connect to MongoDB. Do you have it running?");
  console.log('************************\n');
});
