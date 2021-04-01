begin tran
select (uuid ) from replays 
where uuid = @uuid
if @@rowcount = 0
    begin
        insert into replays (discordId, serverId, channelId, replay, uuid ) values ( @discordId, @serverId, @channelId, @replay, @uuid )
    end
commit tran