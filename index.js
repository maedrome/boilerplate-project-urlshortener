require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');
const dns = require('dns');
const { url } = require('inspector');
let url_list=[];
const regex = /(?<=\/)(www.)?[a-z]+.[a-z]+/gi;
app.use(bodyParser.urlencoded({extended: false}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl' , function(req, res) {
  dns.lookup(req.body.url.match(regex).join(), (err, address, family) => {
    let currentIndex = url_list.findIndex(x => x.url===req.body.url);
    if(err) {
      res.json({error: 'invalid url'});
    }
    else if(currentIndex===-1){
        let short_url_num=Math.floor(Math.random() * 1000);
        while(url_list.find(x => {x.short_url===short_url_num})){
          short_url_num=Math.floor(Math.random() * 1000);
        }
        url_list.push({url:req.body.url,short_url: short_url_num});
        res.json({original_url:req.body.url,short_url: short_url_num});
    }else{
      res.json({original_url:req.body.url,short_url: url_list[currentIndex].short_url})
    }
  }); 
});

app.get('/api/shorturl/:short_url_num', function(req, res) {
  objectindex = url_list.findIndex(x => x.short_url===parseInt(req.params.short_url_num));
  if(objectindex!==-1){
    res.redirect(url_list[objectindex].url);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
