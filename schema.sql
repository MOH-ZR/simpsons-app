CREATE TABLE IF NOT EXISTS
quotes(
     id SERIAL PRIMARY KEY NOT NULL,
     quote VARCHAR(256) ,
    character VARCHAR(256),
    image  VARCHAR(256),
    characterDirection VARCHAR(256)
);