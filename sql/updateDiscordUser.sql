begin tran
   update discordUsers SET id = @id, playerId = @playerId, serverAdmin =  @serverAdmin, globalAdmin = @globalAdmin, impliedName = @impliedName
   where playerId = @playerId

   if @@rowcount = 0
   begin
      insert discordUsers (id, playerId, serverAdmin, globalAdmin, impliedName) values (@id, @playerId, @serverAdmin, @globalAdmin, @impliedName)
      --insert players (id, elo, pickBanElo) values (@playerId, 1500, 1500)
   end
commit tran

