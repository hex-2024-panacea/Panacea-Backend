import { Request, Response } from "express";
import { ZodError, z } from "zod";
import { User } from "../models";
import bcrypt from "bcrypt";
import AuthService from "../services/AuthService";

class AuthController {
    public authService: AuthService = new AuthService();

    // public mailService: MailService = new MailService();
    
    static async signIn(req: Request, res: Response) {
        try {
            const body = z.object({
                email: z.string().email(),
                password: z.string().min(6),
            }).parse(req.body);
            
            
            const user: any = await User
            .where({
                email: body.email
            })
            .findOne()

            if (!user) {
                return res.status(401).json({
                    code: ResponseCode.UNAUTHORIZED,
                    message: "Unauthorized",
                    success: false,
                })
            }

            let salt = bcrypt.genSaltSync(Math.random())
            let password = bcrypt.hashSync(body.password, salt); 
            // let result = bcrypt.compare(password, user.password, (error, result) => {
            //     if (error) {
            //         return res.status(401).json({
            //             code: ResponseCode.UNAUTHORIZED,
            //             message: "Unauthorized",
            //             success: false,
            //         })
            //     }
            //     return result;
            // })

            res.json({
                code: ResponseCode.OK,
                success: true,
                data: user,
            })
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: error.issues,
                });
            }
        }

    }

    static async register(req: Request, res: Response) {
        try {
            const body = z
                .object({
                    name: z.string().min(3),
                    email: z.string().email(),
                    password: z.string().min(6),
                })
                .strict()
                .parse(req.body)
            
            const user = new User;
            user.name = body.name;
            user.email = body.email;
            let salt = bcrypt.genSaltSync(Math.random())
            user.password = bcrypt.hashSync(body.password, salt);
            await user.save();


            res.json({
                code: ResponseCode.OK,
                success: true,
                data: {
                    email: body.email,
                    remainTimes: 300
                }
            })
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                res.status(412).json({
                    code: ResponseCode.INVALID_ENTITY,
                    message: "Invalid Parameter",
                    success: false,
                    errors: error.issues,
                })
            }
        }
    }
    
    static async verifyEmail(req: Request, res: Response) {
        try {
            const user = await User.findOne({
                where: {
                    accessToken: req.headers.token
                }
            })
    
            if (user?.verifyMailSendAt) {
                return res.status(429).json({
    
                })
            }
    
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                res.status(412).json({
                    code: ResponseCode.INVALID_ENTITY,
                    message: "Invalid Parameter",
                    success: false,
                    errors: error.issues,
                })
            }

        }
    }

    static async sendVerifyMail(user: any, email: string) {
        // const service = new MailService();
        // service.sendMail(email);
        return true;
    }
}

export default AuthController;