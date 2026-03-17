# syntax=docker/dockerfile:1

FROM gradle:8.7-jdk17 AS build
WORKDIR /app

# Copy Gradle wrapper + build scripts first for better caching
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew

# Pre-fetch dependencies (best-effort cache warmup)
RUN ./gradlew --no-daemon dependencies || true

# Copy sources and build the runnable jar
COPY src src
RUN ./gradlew --no-daemon clean bootJar


FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
