begin tran
    select id from divisionElo where id = @id
    if @@rowcount = 0
        insert into divisionElo (id, divName, elo) values (@id, @divName, @elo)
    else
        update divisionElo SET elo = @elo  
        where id = @id
commit tran
