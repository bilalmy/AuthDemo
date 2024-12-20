const express=require('express');
const app = express()
const port = 3000
const User=require('./models/user')
const bcrypt=require('bcrypt');
const session=require('express-session')
app.use(express.urlencoded({ extended: true }));
app.use(session({secret : 'verygoodsecret'}));
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/authDemo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected...');
})
.catch(err => {
    console.error('MongoDB Connection Error:', err);
});

app.set('view engine','ejs')
app.set('views','views')


app.get('/',(req,res)=>
{
  res.send('This is your home page');
})

app.get('/register', (req, res) => {
 res.render('register')
})

app.post('/register',async(req,res)=>
{
const {username,password}=req.body;
const saltRounds = 12; // Adjust the salt rounds as needed
const hash = await bcrypt.hash(password, saltRounds);
const user=new User(
  {
username,
password:hash
  }
)
await user.save();
req.session.user_id=user._id;
res.redirect('/login');
})

app.get('/login', (req, res) => {
 res.render('login')
})

app.post('/login', async(req, res) => {
 const {username,password} = req.body;
 const  user=await User.findOne({username});
const validpassword=await bcrypt.compare(password,user.password);
if(validpassword)
{
req.session.user_id=user._id;
res.redirect('/secret');
}
else
{
res.redirect('/login'); 
}

 })


 app.post('/logout',(req,res)=>
{
req.session.user_id=null;
    res.redirect('/login');
})

app.get('/secret', (req, res) => {
  if(!req.session.user_id)
  {
    return res.redirect('/login');
  }
 res.render('secret');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})