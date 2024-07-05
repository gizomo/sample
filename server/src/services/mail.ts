import NodeMailer, {Transporter, SentMessageInfo} from 'nodemailer';

class MailService {
  private transporter: Transporter<SentMessageInfo>;

  constructor() {
    this.transporter = NodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // logger: true,
    });
  }

  public send(to: string, body: string): Promise<any> {
    return this.transporter.sendMail({
      from: 'gizomo@ya.ru',
      to,
      subject: 'Activate your profile',
      html: body,
    });
  }
}

export default new MailService();
