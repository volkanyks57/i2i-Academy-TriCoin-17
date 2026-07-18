FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Maven wrapper ve proje dosyalarını kopyala
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dosya izinlerini ayarla
RUN chmod +x ./mvnw

# Bağımlılıkları indir
RUN ./mvnw dependency:go-offline

# Kaynak kodları kopyala
COPY src src

# Canlı ortam için application.yml örneğini kopyala
RUN cp src/main/resources/application.yml.example src/main/resources/application.yml

# Projeyi derle
RUN ./mvnw clean package -DskipTests

# Çalıştırma aşaması (Daha hafif bir JRE imajı kullanıyoruz)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Derlenen jar dosyasını kopyala
COPY --from=build /app/target/core-0.0.1-SNAPSHOT.jar app.jar

# Portu dışarı aç
EXPOSE 8080

# Uygulamayı başlat
ENTRYPOINT ["java", "-jar", "app.jar"]
