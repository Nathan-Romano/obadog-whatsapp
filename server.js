// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
const moment = require('moment');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const mime = require('mime-types');

const horaAbertura = moment('15:26', 'HH:mm');
const horaFechamento = moment('23:30', 'HH:mm');
const dataAtual = moment();
const verificarStatusHorario = () => {
  return dataAtual.isBetween(horaAbertura, horaFechamento);
};

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/out.png');
});

app.listen(8080, () => {
  console.log('Servidor está ouvindo na porta 8080');
});

// venom
//   .create({
//     session: 'venom', //name of session
//     headless: 'new' //
//   })
//   .then((client) => start(client))
//   .catch((erro) => {
//     console.log(erro);
//   });

venom
  .create(
    'venom',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], 'base64');

      var imageBuffer = response;
      require('fs').writeFile(
        'src/out.png',
        imageBuffer['data'],
        'binary',
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    undefined,
    { logQR: false }
  )
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });



let userState = 0;
const buttons = [
  {
    buttonText: {
      displayText: '📄 Menu 📄'
    }
  },
  {
    buttonText: {
      displayText: '📝 Ver cardápio 📝'
    }
  },
  {
    buttonText: {
      displayText: '🗺 Ver localização 🗺'
    }
  },
  {
    buttonText: {
      displayText: '💭 Falar com um atendente 💭'
    }
  },
  {
    buttonText: {
      displayText: '🖊 Fazer pedido 🖊'
    }
  },
  {
    buttonText: {
      displayText: '💲 Pix 💲'
    }
  }
];

function start(client) {
  
  // setTimeout(() => {
  //   console.log(verificarStatusHorario())
  // }, 1000);
  let isOn = true;
  let msgToDeliver = ''
  let contactNumber = ''
  client.onIncomingCall(async (call) => {
    console.log('nao recebendo', call);
  });
  client.onAnyMessage(async (message) => {
    const welcomeMessageButtons = `Olá ${message.notifyName} 🙋‍♂️! Eu sou o Obabot 🤖.\nBem vindo ao Obadog 🌭. \nPor favor, selecione uma das opções abaixo:`;
    const welcomeMessage = `Olá ${message.notifyName} 🙋‍♂️! Eu sou o Obabot 🤖.\nBem vindo ao Obadog 🌭. \nPor favor, selecione uma das opções abaixo: \n\n 1️⃣ - 📝 Ver cardápio 📝\n 2️⃣ - 🗺 Ver localização 🗺\n 3️⃣ - 💭 Falar com um atendente 💭\n 4️⃣ - 🖊 Fazer pedido 🖊\n 5️⃣ - 💲 Pix 💲`;
    let menuDisplayed = false;
    // this is a part where i transcribe audios to text using 2 whatsapp number api
    // the contact number is saved in another variable dif from the contact so i can send the text back of the transcribed audio
    // if (message.from === '5491150202733@c.us') {
    //   // console.log(contactNumber)
    //   // console.log(message.content)
    //   if (message.content.includes('working...')) {
    //     console.log(message.content)
    //   } else {
    //     msgToDeliver = message.content
    //   // console.log(msgToDeliver)
    //   // console.log(contactNumber)
    //   setTimeout(() => {
    //     isOn = true
    //   }, 4000);
    //   client.sendText(contactNumber, msgToDeliver)
    //   }
    // } else 
    // if (message.from === '553172280540@c.us') {
    //   // console.log(contactNumber)
    //   // console.log(message.content)
    //   if (message.content.includes('Transcri')) {
    //     msgToDeliver = message.content
    //     // console.log(msgToDeliver)
    //     // console.log(contactNumber)


    //     setTimeout(() => {
    //       isOn = true
    //     }, 9000);

    //     client.sendText(contactNumber, msgToDeliver)
    //   }
    // } else 
    // if (message.from !== '553172280540@c.us' && message.from !== '17029641645@c.us' && message.from !== '5491150202733@c.us') {
    //   contactNumber = message.from;
    //   console.log(contactNumber);
    if ((message.fromMe === true || message.from === '554198803189@c.us') && message.content === 'Ligar') {
      client.sendText(message.from, 'Bot Ligado');
      isOn = true;
    } else if ((message.fromMe === true || message.from === '554198803189@c.us') && message.content === 'Desligar') {
      client.sendText(message.from, 'Bot Desligado');
      isOn = false;
    } 
    if (isOn) {
      contactNumber = message.from
      if (message.fromMe === false) {
        if (verificarStatusHorario() === false) {
          client.sendText(
            contactNumber,
            `Ainda não estamos atendendo. Nosso horario de atendimento é de ${horaAbertura.format(
              'HH:mm'
            )} às ${horaFechamento.format('HH:mm')}`
          );
        }  else if (
          message.content &&
          message.content.includes('RESUMO DO PEDIDO')
        ) {
          await client.startTyping(contactNumber);
          client.sendText(contactNumber, 'Pedido Confirmado!! 👍');
        } else if (message.type === 'ptt') {
          await client.setChatState(contactNumber, 1);
          setTimeout(() => {
            client.sendVoice(
              contactNumber,
              './src/obavoz.mp3')
          }, 2000);

          // heres where the code downloads the audio from the contact saves in src/audio.oga, then i converto to .mp3 to actually send as a audio
          // to the whatsapp number that transcribe to text since the forward function from venom is not working.
          // after sending the audio file i delete it from the folder to always the the right audio when sending. 
          // try {
          //   const buffer = await client.decryptFile(message);
          //   const fileName = `audio.${mime.extension(message.mimetype)}`;
          //   const filePath = `./src/${fileName}`;

          //   await new Promise((resolve, reject) => {
          //     fs.writeFile(fileName, buffer, (err) => {
          //       if (err) {
          //         console.error('Erro ao gravar o arquivo:', err);
          //         reject(err);
          //       } else {
          //         console.log('Arquivo salvo com sucesso em:', filePath);
          //         resolve();
          //       }
          //     });
          //   });

          //   setTimeout(() => {
          //     console.log('tempo 1');
          //     const inputFilePath = './audio.oga';
          //     const outputFilePath = './audio.mp3';

          //     ffmpeg(inputFilePath)
          //       .output(outputFilePath)
          //       .on('end', () => {
          //         console.log('Conversão concluída com sucesso!');
          //         setTimeout(() => {
          //           console.log('tempo 2');
          //           client.sendVoice('5531972280540@c.us', outputFilePath)
          //             .then((result) => {
          //               console.log('Audio enviado para Transcrição com sucesso');
          //               client.sendVoice('5491150202733@c.us', outputFilePath)
          //               setTimeout(() => {
          //                 console.log('tempo 3');
          //                 isOn = false;
          //                 fs.unlink(outputFilePath, (err) => {
          //                   if (err) {
          //                     console.error('Erro ao excluir o arquivo:', err);
          //                   } else {
          //                     console.log('Arquivo excluído com sucesso:', outputFilePath);
          //                   }
          //                 });
          //                 fs.unlink(inputFilePath, (err) => {
          //                   if (err) {
          //                     console.error('Erro ao excluir o arquivo:', err);
          //                   } else {
          //                     console.log('Arquivo excluído com sucesso:', inputFilePath);
          //                   }
          //                 });
          //               }, 1000);
          //             })
          //             .catch((erro) => {
          //               console.error('Error when sending: ', erro);
          //             });
          //         }, 1000);
          //       })
          //       .on('error', (err) => {
          //         console.error('Erro ao converter o arquivo:', err);
          //       })
          //       .run();

          //   }, 1000);
          // } catch (error) {
          //   console.error('aqui', error);
          // }


        } else if (!message.isGroupMsg && message.type === 'chat') {
          await client.startTyping(contactNumber);
          if (userState === 0) {
            // se o usuário estiver fora do menu
            userState = 1; // atualiza o estado do usuário para dentro do menu
            setTimeout(() => {
              client.sendText(contactNumber, welcomeMessage);
            }, 1500);
          } else if (userState === 2) {
            // console.log(message.body)
            if (message.body === '0') {
              userState = 0;
              setTimeout(() => {
                client.sendText(contactNumber, 'Atendimento finalizado!!');
              }, 1000);
            }
          } else {
            // se o usuário já estiver no menu
            const option = message.body;
            switch (option) {
              case '1':
                client.sendImage(
                  contactNumber,
                  'src/hotdog.jpg',
                  'pix',
                  'Cardápio Hotdog'
                );
                client.sendImage(
                  contactNumber,
                  'src/smash.jpg',
                  'pix',
                  'Cardápio Smash'
                );
                setTimeout(() => {
                  client.sendText(
                    contactNumber,
                    'Para voltar ao menu principal, digite 0.'
                  );
                }, 1000);
                userState = 0; // atualiza o estado do usuário para fora do menu
                break;
              case '2':
                //sendLocation(chat);
                client.sendLocation(
                  contactNumber,
                  '-26.333577722354224',
                  '-48.84772933290814',
                  'Av. Santa Catarina, 1250 - Floresta, Joinville/SC'
                );
                setTimeout(() => {
                  client.sendText(
                    contactNumber,
                    'Para voltar ao menu principal, digite 0.'
                  );
                }, 1000);
                userState = 0; // atualiza o estado do usuário para fora do menu
                break;
              case '3':
                client.sendText(
                  contactNumber,
                  'Por favor, aguarde. Em breve um alguém irá atendê-lo.'
                );
                //sendAtendente(chat);
                setTimeout(() => {
                  client.sendText(
                    contactNumber,
                    'Para voltar ao menu principal, digite 0.'
                  );
                }, 1000);
                userState = 2;
                // if (message.body === 0) {
                //   userState = 0; // atualiza o estado do usuário para fora do menu
                //   client.sendText(message.from, 'Para voltar ao menu principal, digite 0.');
                // }
                break;
              case '4':
                client.sendText(
                  contactNumber,
                  'Por favor, acesso nosso site para fazer o pedido'
                );
                client.sendLinkPreview(
                  contactNumber,
                  'https://www.obadog.com.br',
                  'Obadog'
                );
                setTimeout(() => {
                  client.sendText(
                    contactNumber,
                    'Para voltar ao menu principal, digite 0.'
                  );
                }, 1000);
                userState = 0; // atualiza o estado do usuário para aguardar pedido
                break;
              case '5':
                client.sendImage(contactNumber, 'src/qr.png', 'pix', 'Pix CNPJ');
                client.sendText(contactNumber, '47.755.195.0001-43');
                client.sendText(contactNumber, 'Aleir Fernando - Banco: C6');
                setTimeout(() => {
                  client.sendText(
                    contactNumber,
                    'Para voltar ao menu principal, digite 0.'
                  );
                }, 1000);
                userState = 0;
                break;
              case '0':
                userState = 0; // atualiza o estado do usuário para fora do menu
                client.sendText(contactNumber, welcomeMessage);
                break;
              default:
                client.sendText(
                  contactNumber,
                  `Opção inválida. ${welcomeMessage}`
                );
                menuDisplayed = true;
                break;
            }
          }
        }
      }
    }
  });
}
