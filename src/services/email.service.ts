import net from 'node:net';
import tls from 'node:tls';

type SmtpSocket = net.Socket | tls.TLSSocket;

const readResponse = (socket: SmtpSocket): Promise<string> => {
  return new Promise((resolve, reject) => {
    let buffer = '';

    const onData = (chunk: Buffer | string) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      const lastLine = lines[lines.length - 2] || '';

      if (/^\d{3} /.test(lastLine)) {
        cleanup();
        resolve(buffer);
      }
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
    };

    socket.on('data', onData);
    socket.once('error', onError);
  });
};

const sendCommand = async (socket: SmtpSocket, command: string): Promise<string> => {
  socket.write(`${command}\r\n`);
  return readResponse(socket);
};

const assertSmtpOk = (response: string, allowedCodes: string[]) => {
  const code = response.slice(0, 3);

  if (!allowedCodes.includes(code)) {
    throw new Error(`SMTP error ${code}: ${response.trim()}`);
  }
};

const sendSmtpEmail = async (input: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<void> => {
  if (!input.secure) {
    throw new Error('SMTP native hien chi ho tro SMTP SSL secure=true, thuong dung cong 465');
  }

  const socket = await new Promise<SmtpSocket>((resolve, reject) => {
    const connection = tls.connect(
      {
        host: input.host,
        port: input.port,
        servername: input.host,
      },
      () => resolve(connection)
    );

    connection.once('error', reject);
  });

  try {
    assertSmtpOk(await readResponse(socket), ['220']);
    assertSmtpOk(await sendCommand(socket, 'EHLO tram-sac-api'), ['250']);
    assertSmtpOk(await sendCommand(socket, 'AUTH LOGIN'), ['334']);
    assertSmtpOk(await sendCommand(socket, Buffer.from(input.user).toString('base64')), ['334']);
    assertSmtpOk(await sendCommand(socket, Buffer.from(input.pass).toString('base64')), ['235']);
    assertSmtpOk(await sendCommand(socket, `MAIL FROM:<${input.from}>`), ['250']);
    assertSmtpOk(await sendCommand(socket, `RCPT TO:<${input.to}>`), ['250', '251']);
    assertSmtpOk(await sendCommand(socket, 'DATA'), ['354']);

    const message = [
      `From: ${input.from}`,
      `To: ${input.to}`,
      `Subject: ${input.subject}`,
      'Content-Type: text/plain; charset=UTF-8',
      'MIME-Version: 1.0',
      '',
      input.text,
      '.',
    ].join('\r\n');

    assertSmtpOk(await sendCommand(socket, message), ['250']);
    await sendCommand(socket, 'QUIT');
  } finally {
    socket.end();
  }
};

export const sendOtpEmail = async (input: {
  to: string;
  code: string;
  purpose: 'register' | 'reset_pin';
}): Promise<void> => {
  const subject =
    input.purpose === 'register'
      ? 'Ma xac minh dang ky tai khoan Tram Sac'
      : 'Ma xac minh dat lai ma PIN Tram Sac';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  // Gmail displays App Passwords with spaces; SMTP authentication needs the compact value.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  if (!host || !from || !user || !pass) {
    console.warn(
      `[OTP DEV] SMTP chưa được cấu hình đầy đủ. ${input.purpose} email=${input.to} code=${input.code}`
    );
    return;
  }

  await sendSmtpEmail({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    user,
    pass,
    from,
    to: input.to,
    subject,
    text: `Ma OTP cua ban la ${input.code}. Ma co hieu luc trong 10 phut.`,
  });
};
