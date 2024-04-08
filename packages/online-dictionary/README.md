# Online Dictionary App

This is an online dictionary web application built with ASP.NET Core and MongoDB.

## Requirements

- Docker
- Web browser

## Build Instructions

To run the application locally, follow these steps:

1. Clone the repository:
```console
git clone https://github.com/midnight-animals/midnight-highgrass-code.git
```
2. Switch to the `online-dictionary` branch
```console
git checkout online-dictionary
```
3. Navigate to the `online-dictionary` folder in the terminal:
```console
cd packages/online-dictionary
```
4. Generate a SSL certificate and configure local machine:

Window:
```powershell
dotnet dev-certs https -ep "$env:USERPROFILE\.aspnet\https\aspnetapp.pfx"  -p password1
dotnet dev-certs https --trust
```
Linux:
```.NET CLI
dotnet dev-certs https -ep ${HOME}/.aspnet/https/aspnetapp.pfx -p password1
```
For more information go to [Hosting ASP.NET Core images with Docker Compose over HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/docker-compose-https?view=aspnetcore-8.0)

5. Run Docker Compose to build and start the application:
```
docker-compose up
```

or for Linux:

```
docker-compose -f docker-compose.yml -f docker-compose.override.linux.yml up
```
6. Access the application in your web browser http://localhost:8080

