import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './models/User.js';

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
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in our db by googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      // Check if user exists by email
      const email = profile.emails[0].value;
      user = await User.findOne({ email });
      if (user) {
        // Link googleId to existing user
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // Create new user
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
        email: email,
        provider: 'google',
        role: 'CLIENT' // Default role
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
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'emails', 'name']
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in our db by facebookId
      let user = await User.findOne({ facebookId: profile.id });
      if (user) {
        return done(null, user);
      }

      const email = profile.emails ? profile.emails[0].value : undefined;
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          // Link facebookId to existing user
          user.facebookId = profile.id;
          await user.save();
          return done(null, user);
        }
      }

      const newUser = new User({
        facebookId: profile.id,
        name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
        email: email, // Note: Email logic might need adjustment if email is missing
        provider: 'facebook',
        role: 'ARTISAN' // logic from original code kept, but might want to standardize
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

      // Plain text check pending bcrypt integration
      // Ideally: await bcrypt.compare(password, user.password)
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

export { passport };