import express from 'express';
const router = express.Router();
import { passport, users } from '../auth.js'; // Updated path to auth.js

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// --- Main Routes ---
router.get('/', (req, res) => {
  let userGreeting = 'Welcome, Guest!';
  if (req.isAuthenticated()) {
    userGreeting = `Welcome, ${req.user.displayName}! (${req.user.role})`;
  }
  res.send(`
    <h1>Artisanal Platform</h1>
    <p>${userGreeting}</p>
    <ul>
      ${req.isAuthenticated() ? `
        <li><a href="/profile">View Profile</a></li>
        <li><a href="/logout">Logout</a></li>
      ` : `
        <li><a href="/login">Login</a></li>
        <li><a href="/signup">Sign Up</a></li>
        <li><a href="/auth/google">Login with Google</a></li>
        <li><a href="/auth/facebook">Login with Facebook</a></li>
      `}
    </ul>
  `);
});

router.get('/login', (req, res) => {
  const errorMessage = req.flash('error');
  res.send(`
    <h1>Login</h1>
    ${errorMessage.length ? `<p style="color:red;">${errorMessage}</p>` : ''}
    <form action="/login/password" method="post">
      <div>
        <label>Email:</label>
        <input type="email" name="email"/>
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password"/>
      </div>
      <div>
        <input type="submit" value="Log In"/>
      </div>
    </form>
    <hr>
    <a href="/auth/google">Login with Google</a><br>
    <a href="/auth/facebook">Login with Facebook</a><br>
    <hr>
    <p>Don't have an account? <a href="/signup">Sign up</a></p>
  `);
});

// --- Profile Route ---
router.get('/profile', isAuthenticated, (req, res) => {
  let profileInfo = `
    <h2>Welcome to your profile, ${req.user.displayName}</h2>
    <p>Your ID: ${req.user.id}</p>
    <p>Your Role: ${req.user.role}</p>
    <p>Provider: ${req.user.provider}</p>
  `;

  if (req.user.role === 'Artisan') {
    profileInfo += '<p>You have access to Artisan-specific features!</p>';
  } else {
    profileInfo += '<p>You have access to Client-specific features.</p>';
  }
  
  profileInfo += '<a href="/">Home</a>';
  res.send(profileInfo);
});

// --- Signup Routes ---
router.get('/signup', (req, res) => {
  res.send(`
    <h1>Sign Up</h1>
    <form action="/signup" method="post">
      <div>
        <label>First Name:</label>
        <input type="text" name="firstName"/>
      </div>
      <div>
        <label>Last Name:</label>
        <input type="text" name="lastName"/>
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email"/>
      </div>
      <div>
        <label>Phone Number:</label>
        <input type="tel" name="phone"/>
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password"/>
      </div>
      <div>
        <input type="submit" value="Sign Up"/>
      </div>
    </form>
    <hr>
    <p>Already have an account? <a href="/login">Login</a></p>
  `);
});

router.post('/signup', (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;
  const userExists = users.find(u => u.email === email);

  if (userExists) {
    return res.redirect('/login');
  }

  const newUser = {
    id: Date.now().toString(),
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    password: password, // In a real app, hash and salt this password
    displayName: `${firstName} ${lastName}`,
    provider: 'local',
    role: 'Client' // or 'Artisan'
  };
  users.push(newUser);

  req.login(newUser, (err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/profile');
  });
});

// --- Google Auth Routes ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  }
);

// --- Facebook Auth Routes ---
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  }
);

// --- Local Auth Route ---
router.post('/login/password',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// --- Logout Route ---
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;