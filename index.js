const express = require('express');
const app = express();

// Endpoint base per testare che il server funzioni
app.get('/', (req, res) => {
  res.send('Server attivo e funzionante su Render!');
});

// Usa la porta fornita da Render tramite la variabile d'ambiente PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto su porta ${PORT}`);
});
