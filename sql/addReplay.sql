begin tran
select (uuid ) from replays 
where uuid = @uuid
if @@rowcount = 0
    begin
        insert into replays (discordId, serverId, channelId, replay, uuid ) values ( @discordId, @serverId, @channelId, @replay, @uuid )
        MERGE person AS TARGET USING OPENJSON(@replay,'$.players') WITH (
                name VarChar(120) 'name',
                id Int 'id'
            ) AS SOURCE
            ON TARGET.id = SOURCE.id
            WHEN MATCHED UPDATE SET TARGET.impliedName = SOURCE.name, TARGET.lastPlayed = getDate()
            WHEN NOT MATCHED BY TARGET  INSERT (id, impliedName, pickBanElo, elo, lastPlayed) VALUES (SOURCE.id, SOURCE.name, 1500, 1500, getDate())
    end
commit tran