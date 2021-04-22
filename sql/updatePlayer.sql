begin tran
   update players SET elo = @elo,  pickBanElo = @pickBanElo
   where Id = @Id
commit tran
