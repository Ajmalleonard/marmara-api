import { MailtrapClient } from 'mailtrap';

const TOKEN = 'f5aec3a48f1d6b641bc18530f32d4032';
// const ENDPOINT = 'https://send.api.mailtrap.io/';

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});
export const sender = {
  email: 'mailtrap@marmaraholidays.com',
  name: 'Marmaraholidays',
};
