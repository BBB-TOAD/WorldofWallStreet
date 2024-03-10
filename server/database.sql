CREATE DATABASE pernNC;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255),  -- For registered users, this field would store their hashed password
  user_type VARCHAR(10) NOT NULL  -- 'registered' or 'guest'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE stocks (
  stock_id SERIAL PRIMARY KEY,
  ticker_symbol VARCHAR(10) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  message_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) NOT NULL,
  stock_id INT REFERENCES stocks(stock_id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refreshtoken (
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
);