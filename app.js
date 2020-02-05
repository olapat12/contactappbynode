var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var urlenconded = require('url');
var bodyparser = require('body-parser');
var json = require('json');
var logger = require('logger');
var methodOveride = require('method-override');
var nano = require('nano')('http://localhost:5984');

var db = nano.use('address');

var app = express();

app.set('port', process.env.PORT || 300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(methodOveride());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

app.post('/createdb', function(req,res){
    nano.db.create(req.body.dbname, function(err){
        if(err){
            res.send("Error creating database "+ req.body.dbname);
            return;
        }
        res.send("Database " + req.body.dbname + " created successfully");
    })
});

app.post('/new_contact', function(req, res){
    var name = req.body.name;
    var phone = req.body.phone;
    db.insert({name : name, phone : phone, crazy : true}, phone, function(err,body,header){
        if(err){
            res.send("Error creating contact");
            return;
        }
        res.send("Contacted created successfully");
    })
})

app.post('/view_contact', function(req,res){
    var alldoc = "following are the contacts";
    db.get(req.body.phone, {revs_info : true}, function(err, body){
        if(!err){
            console.log(body);
        }
        if(body){
            alldoc += "<br/> Name: " +body.name+"<br/>phone number:" +body.phone;
        }
        else{
            alldoc = "No record found";
        }
        res.send(alldoc);
    })
})

app.post("/delete_contact", function(req, res){
    db.get(req.body.phone, {revs_info : true}, function(err,body){
        if(!err){
            db.destroy(req.body.phone, body._rev,function(err,body){
                if(err){
                    res.send("error deleting contact");
                }
            });
            res.send("Contact deleted successfuly")
        }
    })
})

http.createServer(app).listen(app.get('port'), function(){
    console.log("Listening on port "+ app.get('port'))
})