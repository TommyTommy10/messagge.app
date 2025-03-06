# Usa un'immagine base di Node.js
FROM node:16

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file necessari
COPY package*.json ./
RUN npm install

COPY . .

# Esponi la porta usata dal server (ad esempio 3000)
EXPOSE 3000

# Comando per avviare l'app
CMD ["npm", "start"]
