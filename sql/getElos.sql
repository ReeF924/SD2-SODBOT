select (
    players.id as euegenId, 
    players.impliedName as playerName, 
    elo as globalElo, 
    pickBanElo as golbalPickBanElo, 
    @channelId as channelId,
    @serverId as serverId,
    serverElo.elo as serverElo,
    channelElo.elo as channelElo
    ) from discordUsers where discordUsers.id = @playerId
left join players on players.id = discordUsers.playerId
left join elo serverElo on resourceId = @serverId and players.id = serverElo.playerId
left join elo channelElo on resourceId = @channelId and players.id = channelElo.playerId

