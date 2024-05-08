import NodeMailer, { SendMailOptions, SentMessageInfo, Transport, Transporter } from "NodeMailer";

class MailService {
    public transporter: Transporter

    public transport?: Transport 

    constructor() {
        this.transport = this.getProviderTransport()
        this.transporter = NodeMailer.createTransport(this.transport)
    }

    getProviderTransport(): any {
        return {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: Boolean(process.env.MAIL_SECURE),
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        }
    }

    sendMail(mail: SentMessageInfo) {
        this.transporter.sendMail(mail, function(error, info) {
            if (error) return error;
            
            return;
        });
    }
}

export default MailService