-- TriCoin database initialization
-- All tables are created here on first container startup

-- users: registered user accounts
CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    username            VARCHAR(50)  NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    email               VARCHAR(255),
    phone_country_code  VARCHAR(5),
    phone_number        VARCHAR(20),
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- wallets: USD balance per user (1-to-1 with users)
CREATE TABLE wallets (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance_usd DECIMAL(18, 2) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- crypto_holdings: crypto assets per user (many per user)
CREATE TABLE crypto_holdings (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol     VARCHAR(10)    NOT NULL,
    amount     DECIMAL(18, 8) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, symbol)
);

-- transactions: immutable trade history
CREATE TABLE transactions (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol         VARCHAR(10)    NOT NULL,
    side           VARCHAR(4)     NOT NULL CHECK (side IN ('BUY', 'SELL')),
    amount         DECIMAL(18, 8) NOT NULL,
    price_per_unit DECIMAL(18, 2) NOT NULL,
    total_value    DECIMAL(18, 2) NOT NULL,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- price_snapshots: historical price data
CREATE TABLE price_snapshots (
    id          BIGSERIAL PRIMARY KEY,
    symbol      VARCHAR(10)    NOT NULL,
    price       DECIMAL(18, 8) NOT NULL,
    snapshot_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_snapshots_symbol_time ON price_snapshots(symbol, snapshot_at DESC);

-- favorites: user's favorited crypto symbols
CREATE TABLE favorites (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol     VARCHAR(10) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, symbol)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);