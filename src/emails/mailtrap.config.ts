import { MailtrapClient } from 'mailtrap';

export const mailtrapClient = new MailtrapClient({
  token: process.env.TOKEN,
});

export const sender = {
  email: 'mailtrap@marmaraholidays.com',
  name: 'Marmaraholidays',
};
