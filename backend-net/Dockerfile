
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend-net.csproj", "./"]
RUN dotnet restore "backend-net.csproj"
COPY . .
RUN dotnet publish "backend-net.csproj" -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "backend-net.dll"]