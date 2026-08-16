const net = require("net");
const tls = require("tls");
const { env } = require("../config/env");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function readResponse(socket, expectedCodes) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/); buffer = lines.pop();
      for (const line of lines) {
        const match = line.match(/^(\d{3})([ -])(.*)$/); if (!match) continue;
        const code=Number(match[1]);
        if (match[2] === " ") { cleanup(); if (!expectedCodes.includes(code)) reject(new Error(`SMTP ${code}: ${match[3]}`)); else resolve(code); return; }
      }
    };
    const onError = err => { cleanup(); reject(err); };
    function cleanup(){socket.off("data",onData);socket.off("error",onError);}
    socket.on("data",onData);socket.on("error",onError);
  });
}
function connect() {
  return new Promise((resolve,reject)=>{
    const secure=env.smtpPort===465;
    const socket=secure?tls.connect({host:env.smtpHost,port:env.smtpPort,servername:env.smtpHost}):net.connect(env.smtpPort,env.smtpHost);
    socket.once("error",reject); socket.once("connect",()=>{socket.off("error",reject);resolve(socket);});
  });
}
async function sendMail({to,subject,text,html}) {
  const socket=await connect();
  try {
    await readResponse(socket,[220]);
    socket.write(`EHLO ${env.smtpEhloName || "rns-admin"}\r\n`); await readResponse(socket,[250]);
    if(env.smtpPort!==465){
      socket.write("STARTTLS\r\n"); await readResponse(socket,[220]);
      const secureSocket=tls.connect({socket,servername:env.smtpHost});
      await new Promise((resolve,reject)=>{secureSocket.once("secureConnect",resolve);secureSocket.once("error",reject);});
      return sendMailOnSocket(secureSocket,{to,subject,text,html},true);
    }
    return sendMailOnSocket(socket,{to,subject,text,html},false,true);
  } catch(err){socket.destroy();throw err;}
}
async function sendMailOnSocket(socket,mail,afterStartTls=false,greeted=false){
  if(afterStartTls||!greeted){socket.write(`EHLO ${env.smtpEhloName || "rns-admin"}\r\n`);await readResponse(socket,[250]);}
  if(env.smtpUser){
    socket.write("AUTH LOGIN\r\n"); await readResponse(socket,[334]);
    socket.write(`${Buffer.from(env.smtpUser).toString("base64")}\r\n`); await readResponse(socket,[334]);
    socket.write(`${Buffer.from(env.smtpPass).toString("base64")}\r\n`); await readResponse(socket,[235]);
  }
  socket.write(`MAIL FROM:<${env.emailFrom}>\r\n`); await readResponse(socket,[250]);
  socket.write(`RCPT TO:<${mail.to}>\r\n`); await readResponse(socket,[250,251]);
  socket.write("DATA\r\n"); await readResponse(socket,[354]);
  const boundary=`rns-${Date.now()}`;
  const body=[`From: ${env.emailFrom}`,`To: ${mail.to}`,`Subject: ${mail.subject}`,"MIME-Version: 1.0",`Content-Type: multipart/alternative; boundary="${boundary}"`,"",`--${boundary}`,"Content-Type: text/plain; charset=UTF-8","Content-Transfer-Encoding: 8bit","",mail.text,`--${boundary}`,"Content-Type: text/html; charset=UTF-8","Content-Transfer-Encoding: 8bit","",mail.html,`--${boundary}--`,""].join("\r\n").replace(/^\./gm,"..");
  socket.write(`${body}\r\n.\r\n`); await readResponse(socket,[250]); socket.write("QUIT\r\n"); socket.end();
}
async function sendRawMail(mail){ return sendMail(mail); }
async function sendAdminPasswordResetEmail(email,resetUrl){
  const safeUrl=escapeHtml(resetUrl);
  return sendRawMail({to:email,subject:"Reset your RNS INFOTECH admin password",text:`A password reset was requested. Use this link within ${env.adminPasswordResetTtlMinutes} minutes:\n\n${resetUrl}`,html:`<p>A password reset was requested.</p><p><a href="${safeUrl}">Reset your password</a></p><p>This link expires in ${env.adminPasswordResetTtlMinutes} minutes.</p>`});
}
async function sendAdminInvitationEmail(email,name,role,inviteUrl){
  const safeUrl=escapeHtml(inviteUrl);
  return sendRawMail({to:email,subject:"You have been invited to RNS INFOTECH Admin Portal",text:`Hello ${name},\n\nYou have been invited as ${role}. Activate here:\n${inviteUrl}`,html:`<p>Hello ${escapeHtml(name)},</p><p>You have been invited as <strong>${escapeHtml(role)}</strong>.</p><p><a href="${safeUrl}">Set your password and activate your account</a></p>`});
}
async function sendTransactionalEmail(template,recipient,data,eventKey){
  const {queueEmail}=require("./emailTemplates.service");
  return queueEmail({template,recipient,data,event:template,eventKey});
}
module.exports={sendRawMail,sendAdminPasswordResetEmail,sendAdminInvitationEmail,sendTransactionalEmail};
