import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { Repository } from "typeorm";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: ACCESS_TOKEN_SECRET as string
};

passport.use(
    new JwtStrategy(options, async(jwt_payload: { email: string }, done) => {
        try {
            const userRepository: Repository<User> = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({where: { email: jwt_payload.email }});

            if (!user) {
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    })
);

export function passportJWTSetup() {
    passport.initialize();
}