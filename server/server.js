const express = require('express');
const mc = require('./mongoConnect')
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
const port = 8000;
// const ip = "10.0.0.48"; exp://5k-axx.anonymous.mobile.exp.direct:80
const ip = "172.30.81.223";

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// checking connection with server
app.get('/', function (req, res) {
  console.log("Got GET request")
  res.status(200).end();
});

// creating a new account
app.post('/create_account', (req, res) => {
  console.log("Request to create account"); 
  console.log(req.body);
  var name = req.body.f_name + " " + req.body.l_name;
  mc.check_user_existence(req.body.username).then(exists => {
    if (exists) {
      console.log("Username already exists.")
      res.status(403).end();
    } else {
      mc.save_new_account_data(
        name, req.body.username, req.body.password, req.body.email
      );
      console.log("Successfully created new user")
      res.status(201).end();
     }
   });
});

// logging in
app.post('/login', (req, res) => {
  console.log("Request to log in");
  mc.check_login(req.body.username, req.body.password).then(exists => {
    if (exists) {
      console.log("Login credentials match - successful login");
      res.status(204).end();
    } else {
      mc.check_user_existence(req.body.username).then(user_exist => {
        if (user_exist) {
          console.log("Invalid password - unsuccessful login");
          res.status(403).end();
        } else {
          console.log("User does not exist - unsuccesful login");
          res.status(401).end();
        }
      });
    }
  });
});

// check user existence
app.get('/user/:username', (req, res) => {
  mc.check_user_existence(req.params.username).then(exists => {
    if (exists) {
      res.status(200).end();
    } else {
      res.status(400).end();
    }
  });
});

// resetting password
app.patch('/user/:username/profile', (req, res) => {
  mc.change_password(req.params.username, req.body.password).then(_ => {
    console.log("Successfully changed password for %s", req.params.username);
    res.status(204).end();
  }).catch(err => {
    var err_dict = {401 : "User does not exist - cannot change password",
                    403 : "Password is the same as the current one - enter different password"};
    console.log("%s", err_dict[err]);
    res.status(err).end();
  });
});

app.listen(port, ip, function() {
    console.log("Server listening on http://%s:%d", ip, port);
});
