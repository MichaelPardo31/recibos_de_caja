FROM maven:3.9.9-eclipse-temurin-24-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:24-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app-estudiantes.jar
EXPOSE 8080
CMD ["java", "-jar", "app-estudiantes.jar"]
