// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var bodyParser = require('body-parser');
    var multer = require('multer');            
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

    // configuration =================


    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

    var upload = multer({ //multer settings
                    storage: storage
                }).single('file');

    app.post('/upload', function(req, res) {
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            // res.json({error_code:0,err_desc:null});
            var xlsx = require('node-xlsx');
            var fs = require('fs');
            var file = req.file.path;
            var qs = xlsx.parse(file);
            var qs = xlsx.parse(fs.readFileSync(file));
            
            console.log(file);
            function convertToJSON(arr){
                var question = [];

                for(i=0;i<arr[0].data.length;i++){
                    var type=arr[0].data[i][0];


                    switch(type){

                        case "MCQ":
                            var tempoparr=arr[0].data[i][2].split(',');
                            var options=[];
                            
                            for(j=0;j<tempoparr.length;j++){
                                options.push({"id":j+1, "value": tempoparr[j]})
                             }
                            question.push({
                                "type":"MCQ",
                                "question":arr[0].data[i][1],
                                "options":options,
                                "answer":arr[0].data[i][3],
                                "marks":arr[0].data[i][4],
                                "subject":arr[0].data[i][5]
                            });
                            break;

                        case "MMCQ":

                            question.push({
                                "type":"MMCQ",
                                "question":arr[0].data[i][1],
                                "options":arr[0].data[i][2].split(','),
                                "answer":arr[0].data[i][3].split(','),
                                "marks":arr[0].data[i][4],
                                "subject":arr[0].data[i][5]
                            });
                            break;

                        case "FITB":
                            question.push({
                            "type":"FITB",
                            "question":arr[0].data[i][1],
                            "options":arr[0].data[i][2],
                            "answer":arr[0].data[i][3].split(','),
                            "marks":arr[0].data[i][4],
                            "subject":arr[0].data[i][5]
                            });
                            break;

                        case "MTF":
                            question.push({
                            "type":"MTF",
                            "question":arr[0].data[i][1],
                            "options":arr[0].data[i][2].split(','),
                            "answer":arr[0].data[i][3].split(','),
                            "marks":arr[0].data[i][4],
                            "subject":arr[0].data[i][5]
                            });
                            break;

                    };

                }
                    
                
                return JSON.stringify(question);
            }

            var temp=JSON.parse(convertToJSON(qs));
            result = {error_code:0,err_desc:null};
            result.questions = temp;
            res.json(result)


            })
        });
    

    

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");
