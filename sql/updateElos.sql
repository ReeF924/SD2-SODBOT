begin tran
    select (id) from players where id = @eugenId
    if @@rowcount = 0
        insert into players (id, divName, elo, impliedName) values (@id, @divName, @elo, @impliedName)
    else
        update players SET elo = @globalElo, pickBanElo = @pickBanGlobalElo 
        where Id = @eugenId

    select (resourceId, playerId) from elo where resourceId = @serverId and playerId = @playerId
    if @@rowcount = 0
        begin
            insert into elo (resourceId, playerId, elo) values (@serverId, @playerId, @serverElo)
            insert into eloRef (id, servername) values (@serverId, @serverName)
        end
    else
        update elo SET elo = @serverElo where resourceId = @serverId and playerId = @playerId

    select (resourceId, playerId) from elo where resourceId = @channelId and playerId = @playerId
    if @@rowcount = 0
        begin
            insert into elo (resourceId, playerId, elo) values (@channelId, @playerId, @channelElo)
            insert into eloRef (id, servername) values (@channelId, @channelName)
        end
    else
        update elo SET elo = @channelElo where resourceId = @channelId and playerId = @playerId
        
commit tran
