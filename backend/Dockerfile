# Build aşaması: Projeyi derlemek için Maven ve JDK kullan
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src

# Maven'ı çalıştırırken JVM'e dosya encoding'ini UTF-8 olarak zorla
RUN mvn -Dfile.encoding=UTF-8 package -DskipTests

# Run aşaması: Sadece JRE içeren hafif bir imajda uygulamayı çalıştır
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]