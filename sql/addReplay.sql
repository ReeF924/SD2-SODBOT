begin tran
select (uuid ) from replays where uuid = @uuid
if @@rowcount = 0
    begin
        insert into replays (discordId, serverId, channelId, replay, uuid ) values ( @discordId, @serverId, @channelId, @replay, @uuid )
     --   select * INTO #jsontable from openjson(@replay,'$.players') WITH ( name VarChar(120) '$.players.name', id Int '$.players.id' )
     --   MERGE players AS TARGET 
     --   USING #jsonTable AS SOURCE
     --      ON TARGET.id = SOURCE.id
     --      WHEN MATCHED 
     ----          THEN UPDATE SET TARGET.impliedName = SOURCE.name, TARGET.lastPlayed = getDate()
     --      WHEN NOT MATCHED BY TARGET 
     --          THEN INSERT (id, impliedName, pickBanElo, elo, lastPlayed) VALUES (SOURCE.id, SOURCE.name, 1500, 1500, getDate());
    end
commit tran