# i2i-Academy-TriCoin-17
TriCoin - A crypto trading platform with Spring Boot, PostgreSQL, Redis, and Google Gemini LLM


## Setup

1. Copy `docker/.env.example` to `docker/.env`.
2. Copy `core/.env.example` to `core/.env` (or set these values as environment variables in your IDE's run configuration).
3. From the `docker` folder, run `docker-compose up -d` — this starts PostgreSQL and Redis, and the database schema is created automatically.
4. From the `core` folder, run `./mvnw spring-boot:run` to start the backend.
5. Health check: http://localhost:8080/api/health