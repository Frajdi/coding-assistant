# Selecting the latest node version available in linux lts meaning latest, 
# alpine the linux version with the minimal amount of packages needed to run the application.
FROM node:lts-alpine

# Selecting the work directory in the container which in these cases we call app (can call it anything).
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json /app

# Install dependencies for the client
COPY client/package*.json client/
RUN npm run client-install --omit=dev

# Install dependencies for the server
COPY server/package*.json server/
RUN npm run server-install --omit=dev

# Install Vite locally within the client directory
COPY client/ client/
WORKDIR /app/client
RUN npm install vite

# Go back to the main app directory
WORKDIR /app

# Copy the rest of the server code
COPY server/ server/

# Change user to root
USER root
# This will run the command in the cmd to run our application 
CMD ["npm", "run", "deploy"]
# Its safer to give only the user permissions needed to run the app so not to run as root.

# This will expose the port 3000 from our container so when we run the app through
# the container it will run on port 3000 as we set in our env file in the backend 
# and here we are exposing that port from the container to our machine or any machine 
# it will be running on so we can access the application running in the container
EXPOSE 3000
