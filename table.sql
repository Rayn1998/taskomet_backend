CREATE TABLE artist (
 id SERIAL PRIMARY KEY NOT NULL,
 name VARCHAR(50) NOT NULL,
 role VARCHAR(50) NOT NULL,
 tgId VARCHAR(50) NOT NULL
);

CREATE TABLE tasks(
 id SERIAL PRIMARY KEY NOT NULL,
 deadline DATE NOT NULL,
 priority INTEGER NOT NULL,
 executor INTEGER NOT NULL,
 supervisor INTEGER NOT NULL,
 description VARCHAR(500) NOT NULL,
 project VARCHAR(50) NOT NULL,
 scene VARCHAR(50) NOT NULL,
 status INTEGER NOT NULL,
 shot VARCHAR(50) NOT NULL
);

CREATE TABLE projects(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	description VARCHAR(1000)
);

INSERT INTO tasks (project, scene, shot, description, status, priority, executor, supervisor, deadline)
VALUES (
 'HOL',
 'AH-014',
 '0110',
 'трек сцены и портала, трек правой по кадру кисти',
 1,
 1,
 1,
 2,
 '2025-07-10'
);