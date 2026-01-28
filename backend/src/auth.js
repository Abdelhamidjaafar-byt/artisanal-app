import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';

// In-memory user store (replace with a database in a real application)
const users = [];

// Passport serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
},
  (accessToken, refreshToken, profile, done) => {
    // Check if user already exists in our db
    const existingUser = users.find(u => u.email === profile.emails[0].value);
    if (existingUser) {
      // If they do, return that user
      return done(null, existingUser);
    }

    let user = users.find(u => u.id === profile.id);
    if (user) {
      return done(null, user);
    }
    // Assign role based on some logic, here we'll default to 'Client'
    const newUser = {
      id: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      phone: '', // Google doesn't provide phone number by default
      provider: 'google',
      role: 'Client' // or 'Artisan'
    };
    users.push(newUser);
    return done(null, newUser);
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'emails', 'name']
},
  (accessToken, refreshToken, profile, done) => {
    // Check if user already exists in our db
    const email = profile.emails ? profile.emails[0].value : null;
    if (email) {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        // If they do, return that user
        return done(null, existingUser);
      }
    }

    let user = users.find(u => u.id === profile.id);
    if (user) {
      return done(null, user);
    }
    const newUser = {
      id: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: email,
      phone: '', // Facebook doesn't provide phone number by default
      provider: 'facebook',
      role: 'Artisan' // or 'Client'
    };
    users.push(newUser);
    return done(null, newUser);
  }
));

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  (email, password, done) => {
    // In a real app, you'd check the password hash
    let user = users.find(u => u.email === email);
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    if (user.password !== password) { // Plain text comparison (NOT FOR PRODUCTION)
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  }
));

export {
  passport,
  users
};