require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
let port = process.env.PORT || 3005

let db, collection;

const url = process.env.MONGO_URI;
const dbName = "pickup-games";

//connecting to the database
app.listen(port, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if (error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs') // eliminates the need to html because the view is through the ejs
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()) //built into node so we don't necessarily need it
app.use(express.static('public'))

//read
app.get('/', (req, res) => {
    //find all of the messages and add them to an array
    db.collection('games').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('index.ejs', { games: result }) //output of this render is the HTML file
        //render takes the file and spits out the html that was in the file
    })
})

//create
app.post('/games', (req, res) => {
    console.log(req)
    db.collection('games').insertOne({
        sport: req.body.sport,
        location: req.body.location,
        date: req.body.date,
        time: req.body.time,
        position: req.body.position,
        spotsTotal: Number(req.body.spots),
        players: [],
        createdBy: req.body.createdBy
    }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/')
    })
})



//update
app.put('/games', (req, res) => {
    db.collection('games').findOne({ _id: ObjectId(req.body.id) }, (err, game) => {
        //error handling if games aren't found an someone tries to join
        if (err) return res.send(err)
        if (!game) return res.send('Game not found')
        //if the session is full dont add the new player
        if (game.players.length >= game.spotsTotal) {
            return res.send({ full: true })
        }
        db.collection('games')
            .findOneAndUpdate(
                { _id: ObjectId(req.body.id) },
                //addtoSet appends players to the array only is the name isn't already there
                {
                    $addToSet: {
                        players: {
                            name: req.body.player,
                            position: req.body.position
                        }
                    }
                },
                {
                    // sort: { _id: -1 },
                    // upsert: true // if the id is new then create it so it doesn't break our function
                }, (err, result) => {
                    if (err) return res.send(err)
                    res.send(result)
                })
    })
})

app.put('/games/leave', (req, res) => {
    db.collection('games')
        .findOneAndUpdate(
            { _id: ObjectId(req.body.id) },
            { $pull: { players: { name: req.body.player } } },
            (err, result) => {
                if (err) return res.send(err)
                res.send(result)
            })
})

//delete
app.delete('/games', (req, res) => {
    db.collection('games').findOneAndDelete(
        { _id: ObjectId(req.body.id) },
        (err, result) => {
            if (err) return res.send(500, err)
            res.send('Game player or deleted!')
        })
})

