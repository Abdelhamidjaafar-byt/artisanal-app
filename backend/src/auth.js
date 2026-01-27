import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// Passport serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({
        $or: [
          { providerId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for social auth
          provider: 'google',
          providerId: profile.id,
          role: 'CLIENT', // Default role
          avatar: profile.photos[0]?.value
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails', 'name', 'photos']
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails ? profile.emails[0].value : null;
      let user = await User.findOne({
        $or: [
          { providerId: profile.id },
          ...(email ? [{ email }] : [])
        ]
      });

      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: email || `${profile.id}@facebook.auth`,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          provider: 'facebook',
          providerId: profile.id,
          role: 'CLIENT',
          avatar: profile.photos[0]?.value
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      // Support comparing encrypted passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Fallback for plain text if any legacy exists, though User.create now hashes
        if (user.password === password) {
          return done(null, user);
        }
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

export { passport };