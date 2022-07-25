select 
    players.id as eugenId, 
    players.impliedName as playerName, 
    players.elo as globalElo, 
    players.pickBanElo as pickBanGlobalElo, 
    @channelId as channelId,
    @serverId as serverId,
    serverElo.elo as serverElo,
    channelElo.elo as channelElo
     from players 
        left join elo as serverElo on players.id = serverElo.playerId and serverElo.resourceId = @serverId
        left join elo as channelElo on players.id = channelElo.playerId and channelElo.resourceId = @channelId
        where players.id = @playerId --and serverElo.resourceId = @serverId and serverresourceId = @channelId

