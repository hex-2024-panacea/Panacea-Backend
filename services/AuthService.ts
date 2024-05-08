import JsonWebToken from 'jsonwebtoken';
import User from '../models/user';
import bcrypt from "bcrypt";

class AuthService {
    public login(password:string, user: any): boolean {
        const salt = bcrypt.genSaltSync(Math.random());
        const hash = bcrypt.hashSync(password, salt);
        return bcrypt.compareSync(hash, user.password)
    }

    private verifyJwt(user: typeof User, token: string) {
        try {
            const decoded = JsonWebToken.verify(token, 'salt');
            return decoded;
        } catch(error) {
            if (error instanceof JsonWebToken.JsonWebTokenError) {
                return false;
            }
        }
    }

    private genJwt(user: any) {
        try {
            const hash = user.email + user.password;
            return JsonWebToken.sign(hash, 'salt', { expiresIn: '1h' })
        } catch (error) {
            return null;
        }
    }
}

export default AuthService;