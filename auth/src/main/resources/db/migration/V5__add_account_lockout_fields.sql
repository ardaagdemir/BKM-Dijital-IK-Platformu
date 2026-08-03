-- US-02.1.4: Art arda başarısız giriş denemelerinde hesap kilitleme.

ALTER TABLE users
    ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;
