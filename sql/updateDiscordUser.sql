begin tran
   update discordUsers SET id = @id, playerId = @playerId, serverAdmin =  @serverAdmin, globalAdmin = @globalAdmin
   where playerId = @playerId

   if @@rowcount = 0
   begin
      insert discordUsers (id, playerId, serverAdmin, globalAdmin) values (@id, @playerId, @serverAdmin, @globalAdmin)
   end
commit tran

