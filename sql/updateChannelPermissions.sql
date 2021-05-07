begin tran
   update channelBlacklist SET id = @id, channelName = @name, blockElo = @blockElo, blockCommands = @blockCommands, blockReplay = @blockReplay, blockChannelElo = @blockChannelElo, blockServerElo = @blockServerElo, blockGlobalElo = @blockGlobalElo
   where id = @id

   if @@rowcount = 0
   begin
      insert channelBlacklist (id, channelName, blockElo, blockCommands, blockReplay, blockChannelElo, blockServerElo, blockGlobalElo ) values (@id, @name, @blockElo, @blockCommands, @blockReplay, @blockChannelElo, @blockServerElo, @blockGlobalElo)
   end
commit tran