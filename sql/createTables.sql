CREATE TABLE vers
(
    vers int
);

INSERT INTO vers ( vers ) VALUES ( 1 );

CREATE TABLE players
(
    id INT NOT NULL PRIMARY KEY, -- Primary Key column / eugen id
    impliedName text null,
    pickBanElo float NOT NULL DEFAULT(1500),
    elo float NOT NULL DEFAULT(1500), 
    lastPlayed datetime null
);

CREATE TABLE elo
(
    resourceId varchar(30) NOT NULL, -- resource ID. Typically a snowflake for a channel or server.
    playerId INT NOT NULL, -- player ID. a player's eugen id.
    elo float NOT NULL DEFAULT(1500)
)

CREATE TABLE eloRef
(
    id varchar(30) NOT NULL PRIMARY KEY, -- resource id
    serverName text NULL,
    channelName text null
)

CREATE TABLE divisionElo
(
    id int NOT NULL PRIMARY KEY,
    divName text NOT NULL,
    elo float NOT NULL
)

CREATE TABLE channelBlacklist
(
    id varchar(30) NOT NULL PRIMARY KEY,
    channelName text null,
    blockElo  smallint DEFAULT 0,
    blockCommands smallint DEFAULT 0,
    blockReplay smallint DEFAULT 0,
    blockChannelElo smallint DEFAULT 0,
    blockServerElo smallint DEFAULT 0,
    blockGlobalElo smallint DEFAULT 0
)

CREATE TABLE serverBlacklist
(
    id varchar(30) NOT NULL PRIMARY KEY,
    serverName text null,
    blockElo  smallint DEFAULT 0,
    blockCommands smallint DEFAULT 0,
    blockReplay smallint DEFAULT 0,
    blockChannelElo smallint DEFAULT 0,
    blockServerElo smallint DEFAULT 0,
    blockGlobalElo smallint DEFAULT 0
)

CREATE TABLE discordUsers
(
    id varchar(20) NOT NULL, -- Primary Key column / discord id
    playerId int not null PRIMARY KEY, -- map to player/eugenid
    impliedName text NOT NULL,
    serverAdmin text null, -- JSON blob of [int, int]... will list servers user has "admin" on.
    globalAdmin bit not null -- will be used mainly on "web app"
);

CREATE TABLE replays
(
    id INT IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
    uploadedAt datetime DEFAULT(getdate()),
    discordId varchar(20) not null, -- uploader, linked to discordId
    serverId varchar(20) not null, -- what server this was uploaded from
    channelId varchar(20) not null,
    gameId int null, -- will be used to link pick-ban info with replay info.... hopefully
    replay text not null, -- JSON blob
    uuid varchar(40) not null -- unique id to prevent duplciates (is a part of json blob, but pulling it out for this)
);