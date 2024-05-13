import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { User } from "../models";

class UserController {
    static async index(req: Request, res: Response) {
        try {
            const users = await User.find();
            return res.json({
                code: ResponseCode.OK,
                data: users
            })
        } catch (error) {
            // res.status(413).json({
            //     code: ResponseCode.INVALID_ENTITY,
            //     message: "Invalid Parameter",
            //     success: false,
            //     errors: error.issues,
            // })
        }
    }

    static async show(req: Request, res: Response) {
        const user = await User.findById(req.params.id);
        res.json({
            data: user
        })
    }

    static async store(req: Request, res: Response) {
        const body = z
        .object({
            name: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(6)
        })
        .strict()
        .parse(req.body)

        const user: any = await User.create({
            ...body
        })

        res.json({
            data: user
        })
    }

    static async update(req: Request, res: Response) {
        const body = z.object({

        }).strict()
        .parse(req.body)

        const user = await User.findByIdAndUpdate({
            ...body
        })

        res.json({
            code: ResponseCode.OK,
            data: user
        })
    }

    static async destroy(req: Request, res: Response) {
        await User.findByIdAndDelete(req.params.id);
        res.json({
            message: 'Hello World'
        })
    }
}
export default UserController