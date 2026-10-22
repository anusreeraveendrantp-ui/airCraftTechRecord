# Multi-stage build — keeps final image lean
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (layer cache)
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create upload directory
RUN mkdir -p /app/uploads

EXPOSE 8080

# Limit JVM heap for free-tier hosting (Render free = ~512 MB RAM)
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
