import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Passport serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
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
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        let updated = false;
        if (!user.role.includes('CLIENT')) {
          user.role.push('CLIENT');
          updated = true;
        }
        if (user.provider !== 'google') {
          user.provider = 'google';
          updated = true;
        }
        if (updated) await user.save();
        return done(null, user);
      }

      const email = profile.emails[0].value;
      user = await User.findOne({ email });
      if (user) {
        user.googleId = profile.id;
        user.provider = 'google';
        if (!user.role.includes('CLIENT')) {
          user.role.push('CLIENT');
        }
        await user.save();
        return done(null, user);
      }

      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName || profile.username || 'Google User',
        username: email ? (email.split('@')[0] + "_" + profile.id.substring(0, 5)) : ("google_" + profile.id),
        email: email,
        provider: 'google',
        role: ['CLIENT']
      });

      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails', 'name']
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });
      if (user) {
        let updated = false;
        if (!user.role.includes('CLIENT')) {
          user.role.push('CLIENT');
          updated = true;
        }
        if (user.provider !== 'facebook') {
          user.provider = 'facebook';
          updated = true;
        }
        if (updated) await user.save();
        return done(null, user);
      }

      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          user.facebookId = profile.id;
          user.provider = 'facebook';
          if (!user.role.includes('CLIENT')) {
            user.role.push('CLIENT');
          }
          await user.save();
          return done(null, user);
        }
      }

      const newUser = new User({
        facebookId: profile.id,
        name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Facebook User',
        username: email ? (email.split('@')[0] + "_" + profile.id.substring(0, 5)) : ("facebook_" + profile.id),
        email: email,
        provider: 'facebook',
        role: ['CLIENT']
      });

      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err, null);
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

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

export { passport };
