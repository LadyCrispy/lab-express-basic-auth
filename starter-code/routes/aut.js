const express= require('express')
const router= express.Router()
const User= require('../models/User')
const bcrypt = require ('bcrypt')
const bcryptSalt=10

router.get('/signup', (req, res)=>{
  res.render('autent/signup')
})

router.post('/signup', (req, res)=>{
  const {username, password}=req.body

  if(!username || !password){
    res.render('autent/signup', {errMsg: "Rellena los dos campos"})
    return
  }
  if( (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(username)==false){
    res.render('autent/signup', {errMsg: "El usuario debe ser un email"})
    return
  }
  if((/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/).test(password)==false){
    res.render('autent/signup', {errMsg: "La contraseña debe tener al menos una mayus, una minus, un número y entre 8 y 30 caracteres"})
    return
  }

  User.findOne({username})
    .then(foundUser =>{
        if (foundUser) {
            res.render("autent/signup", {errMsg: "Sé más original, eso ya existe"})
            return
        }

        const salt = bcrypt.genSaltSync(bcryptSalt)
        const hashPass = bcrypt.hashSync(password,salt)
      
        User.create({username, password: hashPass})
        .then(createdUser => {
            console.log(createdUser)
            
            res.redirect("/")
        })
        .catch(err => console.log("Algo no va bien", err))

    })
    .catch(err => console.log("Errrooooooor", err))

})



router.get("/login", (req, res) => {
  res.render("autent/login")
})

router.post("/login", (req, res) => {
  const {username, password} = req.body;
  
  User.findOne({username})
  .then(foundUser => {
      if(!foundUser) {
          res.render("autent/login", {errMsg:"Usuario no existe"})
          return
      }
      if(bcrypt.compareSync(password, foundUser.password)){
          req.session.currentUser = foundUser; // guardar en la sesion el usario, con amor Paula :D
          res.redirect("/user/secret");
      } else {
          res.render("autent/login", {errMsg:"password incorrect"})
      }
  })

})


router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    // can't access session here
    if(err) {
        console.log(err)
    }
    res.redirect("/user/login");
  });
});

router.use((req, res, next) => {
  if(req.session.currentUser){
      next();
      return;
  }

})

router.get("/secret", (req, res) => {
  console.log(req.session.currentUser)
  res.render("secret/secret", {user:req.session.currentUser});
})




module.exports=router