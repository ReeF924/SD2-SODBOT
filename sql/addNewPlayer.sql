begin tran
select (id) from players
where id = @playerId
if @@rowcount = 0
    begin
        insert into players (id, elo, pickBanElo, impliedName, lastPlayed ) values ( @playerId, 1500, 1500, @impliedName, @lastPlayed )
    end

commit tran
