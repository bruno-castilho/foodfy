DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

DROP DATABASE IF EXISTS foodfy;
CREATE DATABASE foodfy;

CREATE TABLE users (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "reset_token" TEXT,
  "reset_token_expires" TEXT,
  "is_admin" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT(now()),
  "updated_at" TIMESTAMP DEFAULT(now())
);

CREATE TABLE "file" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "path" text NOT NULL
);

CREATE TABLE "chef" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "file_id" INTEGER REFERENCES file(id),
  "created_at" TIMESTAMP DEFAULT(now())
);

CREATE TABLE "recipe" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "information" text,
  "preparation" text[],
  "ingredients" text[],
  "created_at" TIMESTAMP DEFAULT(now()),
  "updated_at" TIMESTAMP DEFAULT(now()),
  "chef_id" INTEGER REFERENCES chef(id),
  "user_id" INTEGER REFERENCES users(id)
);

CREATE TABLE "recipe_files" (
  "id" SERIAL PRIMARY KEY,
  "recipe_id" INTEGER REFERENCES recipe(id),
  "file_id" INTEGER REFERENCES file(id)
);


CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);

WITH (OIDS=FALSE);
ALTER TABLE "session" 
ADD CONSTRAINT "session_pkey" 
PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
 NEW.updated_at = NOW();
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON recipe
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



