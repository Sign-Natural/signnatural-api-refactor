import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    }
});

export const sendEmailSignup = async (to, subject, firstName, role) => {
    const emailTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Sign Natural Academy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            font-size: 24px;
            color: #333;
        }
        .message {
            font-size: 16px;
            color: #555;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Welcome ${firstName}</h1>
        <h1 class="header">Thank You for Signing Up!</h1>
        <p class="message">We're excited to have you as part of our community as a learner. We hope you have an amazing learning experience</p>
        <p class="footer">If you have any questions, feel free to <a href="#">contact us</a>.</p>
    </div>
</body>
</html>
`

    const send = await transporter.sendMail(
        {
            from: process.env.USER_EMAIL,
            to: to,
            subject: subject,
            html: emailTemplate
        }
    )
    console.log("email sent", send)
}

