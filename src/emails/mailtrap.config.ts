import { MailtrapClient } from 'mailtrap';

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
  email: 'mailtrap@marmaraholidays.com',
  name: 'Marmaraholidays',
};
