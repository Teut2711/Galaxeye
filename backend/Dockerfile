FROM node

WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

EXPOSE 3000

# Start the application
CMD [ "node", "index.js" ]
