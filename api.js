const express = require('express');
const venom = require('venom-bot');

const app = express();
const port = 8000;

app.use(express.json());

venom
  .create({ session: 'api', headless: 'new' })
  .then((client) => {
    app.post('/send-text', (req, res) => {
      const { number, message } = req.body;
      client
        .sendText(number, message)
        .then(() => {
          console.log(`Texto enviado para ${number}: ${message}`);
          res.sendStatus(200);
        })
        .catch((error) => {
          console.error('Erro ao enviar texto:', error);
          res.sendStatus(500);
        });
    });

    app.post('/send-location', (req, res) => {
      const { number, latitude, longitude, address } = req.body;
      client
        .sendLocation(number, latitude, longitude, address)
        .then(() => {
          console.log(`Localização enviada para ${number}`);
          res.sendStatus(200);
        })
        .catch((error) => {
          console.error('Erro ao enviar localização:', error);
          res.sendStatus(500);
        });
    });

    app.post('/send-image', (req, res) => {
      const { number, path, caption } = req.body;
      client
        .sendImage(number, path, caption)
        .then(() => {
          console.log(`Imagem enviada para ${number}`);
          res.sendStatus(200);
        })
        .catch((error) => {
          console.error('Erro ao enviar imagem:', error);
          res.sendStatus(500);
        });
    });

    app.post('/send-voice', (req, res) => {
      const { number, path } = req.body;
      client
        .sendVoice(number, path)
        .then(() => {
          console.log(`Áudio enviado para ${number}`);
          res.sendStatus(200);
        })
        .catch((error) => {
          console.error('Erro ao enviar áudio:', error);
          res.sendStatus(500);
        });
    });

    app.listen(port, () => {
      console.log(`API está ouvindo na porta ${port}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao iniciar o Venom:', error);
  });
