import nodemailer from 'nodemailer'

export const nodemailerClient = nodemailer.createTransport(
  JSON.parse(process.env.MAIL_CONFIG ?? '{}'),
)
