CREATE TABLE vers
(
    vers int
);

INSERT INTO vers ( vers ) VALUES ( 1 );

CREATE TABLE players
(
    id INT NOT NULL PRIMARY KEY, -- Primary Key column / eugen id
    elo float NOT NULL,
    pickBanElo float NOT NULL
);

CREATE TABLE discordUsers
(
    id varchar(20) NOT NULL , -- Primary Key column / discord id
    playerId int not null PRIMARY KEY, -- map to player/eugenid
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