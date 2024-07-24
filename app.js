const express = require('express');
const app = express();

const userModel = require(`./models/user`);
const postModel = require(`./models/post`);

const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    // 423@filmiIndian
    res.render('login');
})

app.post('/register', async (req, res) => {
    const { username, name, email, age, password } = req.body;
    // pehle user check krenge
    let user = await userModel.findOne({ email })
    // agar user mila toh create nhi krenge
    if (user) return res.status(500).send('User already exists');
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                username, name, email, age, password: hash
            })
            // jo bhi banaya hai uska email aur userid save krenge token bhejne ke liye
            let token = jwt.sign({ email: email, userid: user._id }, 'securekey')
            res.cookie("token", token);
            // res.send('User registered');
            res.redirect('/p')
        })
    })
})

app.post('/login', async (req, res) => {
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send(`User doesn't exists`);

    bcrypt.compare(password, user.password, (err, result) => {
        if(result){
            let token = jwt.sign({ email: email, userid: user._id }, 'securekey')
            res.cookie("token", token);
            // res.status(200).send('you can login');
            res.redirect(`/p`)
        }
        else res.redirect('/login')
    })
})

app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('login')
})

// middleware for protected routes
function isLoggedIn(req, res, next) {
    // if(req.cookies.token === '') res.send('please login');
    if(req.cookies.token === '') res.redirect('login');
    else {
        let data = jwt.verify(req.cookies.token, 'securekey')
        req.user = data;
        next();
    }
}

app.get('/p', isLoggedIn, async (req, res) => {
    // let user = await userModel.findOne({ email: req.user.email });
    // let posts = await postModel.find({ _id: { $in: user.posts } }); // Manually finding posts by their IDs
    // res.render('profile', { user, posts }); // Passing both user and posts to the template


    // upar do baar na karke hum aise bhi kr skte hai populate use karke
    let user = await userModel.findOne({email: req.user.email}).populate("posts");

    res.render('profile', {user}); // profile ejs pe humne user ko send kr diya hai, agar ooper wale tarike se post find kiya hai to post bhi bhejna hota profile ejs mein
})

app.get('/createpost', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email}) // ye req.user.email ooper isLogedIn se aa rha hai
    res.render('createpost', {user}); // profile ejs pe humne user ko send kr diya hai
})

app.post('/createpost', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email});

    let {content} = req.body;
    let post = await postModel.create({content, user: user._id});

    await user.posts.push(post._id);
    await user.save();
    res.redirect('/p')
})
app.listen(3000, () => console.log('server running on 3000'));