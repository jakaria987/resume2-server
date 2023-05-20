const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpvu0c0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("toyShop");
    const toysCollection = db.collection("toys");

    const indexKeys = {Name: 1};
    const indexOptions = {name: "toyName"};

    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get('/toySearch/:text', async(req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection.find({
        $or: [
          {Name : {$regex:'\\b' + searchText + '\\b', $options: "i"}},
        ],
      }).toArray();
      res.send(result)
    })

    app.patch('/myToys/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updatedToy = req.body;
      console.log(updatedToy);

      const updateDoc = {
        $set: {
          status: updatedToy.status
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete('/myToys/:id' , async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

  //      app.get('/myToys/:id', async(req, res) => {
  //     const id = req.params.id;
  //     const query = {_id : new ObjectId(id)};
  //     const result = await toysCollection.findOne(query);
  //     res.send(result)
  // })

    app.post('/postToys', async(req, res) => {
        const body = req.body;
        // if(!body){
        //     return res.status(404).send({message: "Not valid request"});
        // }
        const result = await toysCollection.insertOne(body);
        res.send(result)
        console.log(result);
    })
    
    app.get('/allToys', async(req, res) => {
        const result = await toysCollection.find().toArray();
        res.send(result);
    })

    app.get('/allToys/:text', async(req, res) => {
      if(req.params.text == "ScienceToys" || req.params.text == "MathToys" || req.params.text == "EngineeringKits"){
        const result = await toysCollection.find({sub_category: req.params.text}).toArray();
        return res.send(result);
      }
        const result = await toysCollection.find().toArray();
        res.send(result);
    })

    app.get('/allToys/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await toysCollection.findOne(query);
        res.send(result)
    })

    app.get('/myToys/:seller_email', async(req, res)=> {
      const result = await toysCollection.find({seller_email: req.params.seller_email}).toArray();
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("toys are running");
})

app.listen(port, () => {
    console.log(`toy server is running on port : ${port}`);
})