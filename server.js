const express = require('express');
const bodyParser = require('body-parser');
 const mongoose = require('mongoose');
 const path = require('path');

const port = 8000;
const multer = require('multer');
const jwt = require('jsonwebtoken')
const session = require('express-session');

const app = express();
const mongodb = require('mongodb')
const uri = 'mongodb+srv://haodtph27524:AgV4IfwmFln1Z0PG@atlascluster.ip5xlax.mongodb.net/cp17301?retryWrites=true&w=majority';

const SanPhamModel = require('./models/SanPhamModel');
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const exphbs = require('express-handlebars');
const UserModel = require('./models/UserModel');
app.use(express.static('public'));

app.engine('.hbs', exphbs.engine({
    extname: "hbs",
    defaultLayout: 'main'
}))
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
  const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
        res.redirect('/')
    }
  }
app.set('view engine', '.hbs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        let fileName = file.originalname;
        console.log(fileName);

        let arr = fileName.split('.');
        let newFileName = arr[0] + '-' + Date.now() + '.' + arr[1];

        cb(null,newFileName)
    }
})

var upload = multer({ storage: storage })


// Khai báo route cho trang đăng nhập
app.get('/', function (req, res) {
    res.render('login-signup', {
        style: 'style.css'
    })
});
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        let fileName = file.originalname;
        console.log(fileName);

        let arr = fileName.split('.');
        let newFileName = arr[0] + '-' + Date.now() + '.' + arr[1];

        cb(null,newFileName)
    }
})

var upload = multer({ storage: storage })

app.get('/dashboard', function (req, res) {
    res.render('dashboard')
});
app.get('/addUs',(req,res) =>{
    res.render('addUser',{style:'addUser.css'});
})
app.get('/userProfile',isAuthenticated,async function (req, res) {
    const isAdmin = req.session.user.isAdmin;
     const userEmail = req.session.user.email;
    console.log(isAdmin)
    await mongoose.connect(uri);
    console.log('Ket noi DB thanh cong');
  const userData= await UserModel.find().lean();
 
const data = await UserModel.findOne({email: userEmail}).lean();
    if(isAdmin){
        res.render('userProfile',{userData})
    }else{
        res.render('Profile',{data: data})
    }
});
app.post('/addNewUser', async(req,res) =>{

    await mongoose.connect(uri);
    console.log('Ket noi DB thanh cong');
    let name = req.body.name;
    let email = req.body.email;
    let  password= req.body.password;
    let check = req.body.check;
    let isAdmin = check?true:false;
  let user = new UserModel({name,email,password,isAdmin});
  await user.save();
  const userData = await UserModel.find().lean();
  res.render('userProfile',{userData});
})
app.get('/edit', async (req, res) => {
    let idUp = req.query.idEdit
    console.log(idUp);
    try {
        const list = await SanPhamModel.find().lean()
        let nvUp = await SanPhamModel.find({ _id: new mongodb.ObjectId(`${idUp}`) }).lean()
        res.render('editPr', { data: list, sanpham: nvUp[0], index: idUp })
    } catch (error) {
        console.log(error);
    }   
})
    app.get('/updatePr/done', async (req, res) => {
        let name = req.query.name
        let price= req.query.price
        let color = req.query.color
        let typePr = req.query.typePr
        let idKh = req.query.idKh   
        let idPr = req.query.idPr
        try {
            await   SanPhamModel.updateOne({ _id: new mongodb.ObjectId(`${idPr}`)}, { $set: {name,price,color,typePr,idKh} })
            res.redirect('/tableList')        
        } catch (error) {
            
        }
    })
app.post('/signup', async(req,res) =>{

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    
    UserModel.findOne({
        email:email,
    })
    .then(data=>{
        if(data){
            console.log('tài khoản đã tồn tại')
        }else{
            return UserModel.create({
                name:username,
                password:password,
                email: email

            })
            .then(data=>{
                console.log('thành công')
                res.render('login-signup', {
                    style: 'style.css'
                })
            })
        }
    })
    .catch(err =>{
        res.status(500).json('tạo thất bại');
    })
})
app.post('/dangnhap',async (req, res) => {
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    const email = req.body.email;
    const password = req.body.pwd;
    UserModel.findOne({
        email:email,
        password:password,
    })
    .then(data=>{
        if(data){
            // req.session.user = {
            //     email: email,
            //     isAdmin: data.isAdmin
            // };
            // req.session.save();
            req.session.user = data;
            res.render('dashboard');
        }else{
            res.json('Thất bại')
        }
    })
    .catch(err =>{
        res.status(500).json('có lỗi trong data');
    })
    
        // Save user in session
 
    });
app.get('/tableList', async  (req, res) =>{
    await mongoose.connect(uri);
      console.log('Ket noi DB thanh');
    const PrData= await SanPhamModel.find().lean();
    res.render('tableList', {PrData});
});
app.get('/addNewPr', (req, res) => {
    res.render('addPr');
  });

  app.post('/addNewPrF',async (req, res) => {
    await mongoose.connect(uri);
      console.log('Ket noi DB thanh cong');
      const {name,price,color,typePr,idKh}  = req.body;
    const sanpham = new SanPhamModel({name,price,color,typePr,idKh});
    await sanpham.save();
    res.redirect('tableList');
  });
  app.get('/delete', async (req, res) => {
    let idPr = req.query.idPr
    try {
         SanPhamModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${idPr}`) })
        res.redirect('tableList')
    } catch (error) {
      console.log(error);
    }})
    app.get('/deleteUs', async (req, res) => {
        let idUs = req.query.idUs
        try {
             UserModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${idUs}`) })
            res.redirect('userProfile')
        } catch (error) {
          console.log(error);
        }})

        // sửa USER
        app.get('/editUs', async (req, res) => {
            let idUpdate = req.query.idEdit
        
            try {
                const list = await UserModel.find().lean()
                let us = await UserModel.find({ _id: new mongodb.ObjectId(`${idUpdate}`) }).lean()
                // let arr =  nv.ten.split('');
                res.render('editUser', {index: idUpdate, us: us[0], dataPr: list })
                // console.log(arr)
            } catch (error) {
                console.log(error);
        
            }
        })
        
        app.get('/updateUser', async (req, res) => {
            let name = req.query.name
            let email = req.query.email
            let idUs = req.query.idUs
            let password = req.query.password
            let check = req.query.check
            let isAdmin = check?true:false
            try {
                await mongoose.connect(uri)
                await UserModel.collection.updateOne({ _id: new mongodb.ObjectId(`${idUs}`) }, { $set: {name,email,password,isAdmin} })
                res.redirect('/userProfile')
            } catch (error) {
        
            }
        })

app.listen(port,()=>console.log(`listen at ${port}`))


