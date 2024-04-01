# Online Dictionary App

This is an online dictionary web application built with ASP.NET Core and MongoDB.

## Requirements

- Docker
- Web browser

## Build Instructions

To run the application locally, follow these steps:

1. Clone the repository:
```
git clone https://github.com/midnight-animals/midnight-highgrass-code.git
```
2. Switch to the `online-dictionary` branch
```
git checkout online-dictionary
```
3. Navigate to the `online-dictionary` folder in the terminal:
```
cd packages/online-dictionary
```
4. Run Docker Compose to build and start the application:
```
docker-compose up
# or
sudo docker compose -p online-dictionary -f ./docker-compose.yml up -d
```
5. Access the application in your web browser
http://localhost:8080

