import { Schema, model } from 'mongoose';

interface IUser {
    name: string;
    email: string;
    password: string;
    avatar: string;
    emailVerifiedAt?: Date;
    verifyMailSendAt?: Date;
    accessToken?: string;
    mailVerifyToken?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const User = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        hidden: true
    },
    avatar: {
        type: String,
        default: null,
    },
    emailVerifiedAt: {
        type: Date,
        default: null,
    },
    verifyMailSendAt: {
        type: Date,
        default: null,
    },
    mailVerifyToken: {
        type: String,
        default: null,
    },
    accessToken: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        cast: true
    },
    deletedAt: {
        type: Date
    },
}, {
    collection: 'users',
    versionKey: false,
})

export default model('User', User);