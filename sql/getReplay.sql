begin tran
select uploadedAt,
  JSON_VALUE(replay, '$.players'),
  JSON_VALUE(replay, '$.ingamePlayerId'),
  JSON_VALUE(replay, '$.result.victory'),
from replays
where ISJSON(replay) > 0
  and JSON_VALUE(replay, '$.players.id') = @playerId
  and status = 'Active'
order by uploadedAt