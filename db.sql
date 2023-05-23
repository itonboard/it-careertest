CREATE TABLE client (
    id          CHAR(36)    PRIMARY KEY,
    started     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished    TIMESTAMP,
    user_agent  TEXT,
    language    CHAR(2),
    results     JSON        NOT NULL DEFAULT '{}'
);

CREATE VIEW client_with_duration (id, started, finished, duration, user_agent, language, results) AS
    SELECT
        id,
        started,
        IF(finished = 0, NULL, finished),
        IF(finished = 0, NULL, TIMEDIFF(finished, started)),
        user_agent,
        language,
        results
    FROM client;
