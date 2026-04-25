import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import { User } from "../modules/user/user.model";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, {
            message: "No account found with this email address.",
          });
        }

        const user = await User.findOne({ email });
        if (user) {
          return done(null, user, {
            message: "An account with this email address already exists.",
          });
        }

        const newUser = await User.create({
          email,
          firstName: profile.displayName,
          lastName: profile.displayName,
          image: {
            public_id: "",
            url: profile.photos?.[0].value,
          },
          role: "user",
          isVerified: true,
          auth: [{ provider: "google", providerId: profile.id }],
        });
        return done(null, newUser, {
          message: "User account created successfully.",
        });
      } catch (error) {
        console.log("google strategy error", error);
        return done(error);
      }
    },
  ),
);


passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});