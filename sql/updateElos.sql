begin tran
    select id from players where id = @playerId
    if @@rowcount = 0
        insert into players (id, pickBanElo, elo, impliedName, lastPlayed) values (@playerId, @pickBanGlobalElo, @globalElo, @impliedName, getDate())
    else
        update players SET elo = @globalElo, pickBanElo = @pickBanGlobalElo, lastPlayed = getDate() 
        where Id = @playerId

    select resourceId, playerId from elo where resourceId = @serverId and playerId = @playerId
    if @@rowcount = 0
        begin
            insert into elo (resourceId, playerId, elo) values (@serverId, @playerId, @serverElo)
            BEGIN TRY
                insert into eloRef (id, servername) values (@serverId, @serverName)
            END TRY
            BEGIN CATCH
            PRINT '';
            END CATCH
        end
    else
        update elo SET elo = @serverElo where resourceId = @serverId and playerId = @playerId

    select resourceId, playerId from elo where resourceId = @channelId and playerId = @playerId
    if @@rowcount = 0
        begin
            insert into elo (resourceId, playerId, elo) values (@channelId, @playerId, @channelElo)
            BEGIN TRY
            insert into eloRef (id, channelname) values (@channelId, @channelName)
            END TRY
            BEGIN CATCH
            PRINT '';
            END CATCH
        end
    else
        update elo SET elo = @channelElo where resourceId = @channelId and playerId = @playerId
        
commit tran
