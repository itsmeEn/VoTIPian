votipian\server\npm run dev 
votipian\client\npm start
net start MongoDB

# Stop and remove any existing containers
docker-compose down

# Remove any cached images
docker-compose rm -f

# Build and start the containers with logs
docker-compose up --build