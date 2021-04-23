select
    players.id as eugenId, 
    players.impliedName as playerName, 
    players.elo as globalElo, 
    players.pickBanElo as pickBanGlobalElo, 
    @channelId as channelId,
    @serverId as serverId,
    serverElo.elo as serverElo,
    channelElo.elo as channelElo
    from discordUsers 
    left join players on players.id = discordUsers.playerId
    left join elo serverElo on serverElo.resourceId = @serverId and players.id = serverElo.playerId
    left join elo channelElo on channelElo.resourceId = @channelId and players.id = channelElo.playerId
    where discordUsers.id = @playerId

