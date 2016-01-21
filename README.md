# Passport-Remember Me

This repository was formed from Jared Hansons Remember me Passport.js

I have updated some of the node modules for express 4, and will be incorporating this into a React project


[Passport](http://passportjs.org/) strategy for authenticating based on a
remember me cookie.

This module lets you authenticate using a remember me cookie (aka persistent
login) in your Node.js applications.  By plugging into Passport, remember me
authentication can be easily and unobtrusively integrated into any application
or framework that supports [Connect](http://www.senchalabs.org/connect/)-style
middleware, including [Express](http://expressjs.com/).

## Usage

#### Configure Strategy

The remember me authentication strategy authenticates users using a token stored
in a remember me cookie.  The strategy requires a `verify` callback, which
consumes the token and calls `done` providing a user.

The strategy also requires an `issue` callback, which issues a new token.  For
security reasons, remember me tokens should be invalidated after being used.
The `issue` callback supplies a new token that will be stored in the cookie for
next use.

    passport.use(new RememberMeStrategy(
      function(token, done) {
        Token.consume(token, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user);
        });
      },
      function(user, done) {
        var token = utils.generateToken(64);
        Token.save(token, { userId: user.id }, function(err) {
          if (err) { return done(err); }
          return done(null, token);
        });
      }
    ));




#### Security Considerations

If not managed correctly, using a "remember me" cookie for automatic
authentication increases a service's exposure to potential security threats.
There are a number of techniques to reduce and mitigate these threats, and it
is a matter of application-level policy to asses the level of risk and implement
appropriate counter measures.

The following list is recommended reading for understanding these risks:

- [The definitive guide to forms based website authentication](http://stackoverflow.com/questions/549/the-definitive-guide-to-forms-based-website-authentication)
- [Persistent Login Cookie Best Practice](http://fishbowl.pastiche.org/2004/01/19/persistent_login_cookie_best_practice/)
- [Improved Persistent Login Cookie Best Practice](http://jaspan.com/improved_persistent_login_cookie_best_practice) [(archive)](http://web.archive.org/web/20130214051957/http://jaspan.com/improved_persistent_login_cookie_best_practice)

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-remember-me/tree/master/examples/login).

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

Copyright (c) 2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
