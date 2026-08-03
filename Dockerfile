FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Önce yalnızca pom.xml'ler — bağımlılıklar, kaynak kod değişmediği sürece
# Docker layer cache'inden gelsin.
COPY pom.xml .
COPY core/pom.xml core/
COPY auth/pom.xml auth/
COPY organization/pom.xml organization/
COPY leave/pom.xml leave/
COPY recruitment/pom.xml recruitment/
COPY performance/pom.xml performance/
COPY attendance/pom.xml attendance/
COPY training/pom.xml training/
COPY travel/pom.xml travel/
COPY discipline/pom.xml discipline/
COPY feedback/pom.xml feedback/
COPY amenities/pom.xml amenities/
COPY payroll/pom.xml payroll/
COPY bootstrap/pom.xml bootstrap/
RUN mvn -B dependency:go-offline

COPY core/src core/src
COPY auth/src auth/src
COPY organization/src organization/src
COPY leave/src leave/src
COPY recruitment/src recruitment/src
COPY performance/src performance/src
COPY attendance/src attendance/src
COPY training/src training/src
COPY travel/src travel/src
COPY discipline/src discipline/src
COPY feedback/src feedback/src
COPY amenities/src amenities/src
COPY payroll/src payroll/src
COPY bootstrap/src bootstrap/src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/bootstrap/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
