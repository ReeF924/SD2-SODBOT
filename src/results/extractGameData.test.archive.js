const { extractGameData } = require("./extractGameData");
const { mockStartData, mockEndData, message } = require("../test-utils.js");
const playerData = require("./fetchPlayerData");

afterEach(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  jest.resetModules();
});

//Use mocked fetchPlayerData
jest.mock("./fetchPlayerData");

const fn = jest.fn();
const mockedMessage = message(fn);

//todo - fix jest not properly resetting - each test currently passes when run independantly
describe("extractGameData()", () => {
  it.only("should return error message to channel when player 1 is unknown", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678" }]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "678678" }]); //winner (must copy one of the ones above)
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({})
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: "",
      mapName: "Smolyany",
      outCome: "",
      player1DeckCode: "",
      player1DiscordId: undefined,
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: ""
    });
    expect(fn).toBeCalledWith(
      "player name 1 is an unknown player to the bot, results will not be recorded nor can the outcome be determined."
    );
  });

  it("should return error message to channel when player 2 is unknown", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "12345" }]) //player 1
      .mockReturnValueOnce([]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "12345" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({})
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: "",
      mapName: "Smolyany",
      outCome: "",
      player1DeckCode: "",
      player1DiscordId: "12345",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: undefined,
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: ""
    });
    expect(fn).toBeCalledWith(
      "player name 2 is an unknown player to the bot, results will not be recorded nor can the outcome be determined."
    );
  });

  it("should return error message to channel when both players are unknown", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([]) //player 1
      .mockReturnValueOnce([]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "12345" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({})
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: "",
      mapName: "Smolyany",
      outCome: "",
      player1DeckCode: "",
      player1DiscordId: undefined,
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: undefined,
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: ""
    });
    expect(fn).toBeCalledWith(
      "Both players are unknown to the bot, results will not be recorded nor can the outcome be determined."
    );
  });

  it("should return error message if both players are known but msg author is unknown", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]) //player 2
      .mockReturnValueOnce([]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({})
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: "",
      mapName: "Smolyany",
      outCome: "",
      player1DeckCode: "",
      player1DiscordId: "098765",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: ""
    });
    expect(fn).toBeCalledWith(
      "Message author is unknown, results will not be recorded nor can the outcome be determined."
    );
  });

  it("should return error message if both players are known but msg author is 3rd party", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "abcdef", EugenUID: "abcdef" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({})
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: "",
      mapName: "Smolyany",
      outCome: "",
      player1DeckCode: "",
      player1DiscordId: "098765",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: ""
    });
    expect(fn).toBeCalledWith(
      "Message author is not in the replay, results will not be recorded nor can the outcome be determined."
    );
  });

  it("should return error message if game is somehow a draw", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({ victory: 3 })
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: "",
      mapName: "Smolyany",
      outCome: "",
      player1DeckCode: "",
      player1DiscordId: "098765",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: ""
    });
    expect(fn).toBeCalledWith(
      "SODBOT does not currently support draws, please contact an <@84696940742193152> to have your results manually added."
    );
  });

  it("if author is player 1 and victory is 0/1/2 then player 2 is winner", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({ victory: 1 })
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: { DiscordUID: "098765", EugenUID: "098765" },
      mapName: "Smolyany",
      outCome: "Major Defeat",
      player1DeckCode: "",
      player1DiscordId: "098765",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: { DiscordUID: "678678", EugenUID: "678678" }
    });
  });

  it("if author is player 2 and victory is 0/1/2 then player 1 is winner", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({ victory: 1 })
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: { DiscordUID: "678678", EugenUID: "678678" },
      mapName: "Smolyany",
      outCome: "Major Defeat",
      player1DeckCode: "",
      player1DiscordId: "098765",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: { DiscordUID: "098765", EugenUID: "098765" }
    });
  });

  it("if author is player 1 and victory is 4/5/6 then player 1 is winner", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({ victory: 4 })
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: { DiscordUID: "678678", EugenUID: "678678" },
      mapName: "Smolyany",
      outCome: "Minor Victory",
      player1DeckCode: "",
      player1DiscordId: "098765",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: { DiscordUID: "098765", EugenUID: "098765" }
    });
  });

  it("if author is player 2 and victory is 4/5/6 then player 2 is winner", async () => {
    playerData.fetchPlayerData
      .mockReturnValue("default")
      .mockReturnValueOnce([{ DiscordUID: "098765", EugenUID: "098765" }]) //player 1
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]) //player 2
      .mockReturnValueOnce([{ DiscordUID: "678678", EugenUID: "678678" }]); //author of the message
    expect(
      await extractGameData({
        message: mockedMessage,
        startData: mockStartData({}),
        endData: mockEndData({ victory: 5 })
      })
    ).toEqual({
      duration: "25 minutes : 54 seconds",
      gameMode: "Conquest",
      gameName: "Mock data game",
      gameVersion: "21421",
      income: "None",
      loser: { DiscordUID: "098765", EugenUID: "098765" },
      mapName: "Smolyany",
      outCome: "Major Victory",
      player1DeckCode: "",
      player1DiscordId: "098765",
      player1Division: "Unknown division code",
      player1EugId: "8642365472345245456",
      player1Level: "1",
      player1Name: "player name 1",
      player2DeckCode: "",
      player2DiscordId: "678678",
      player2Division: "Unknown division code",
      player2EugId: "18446744073709551615",
      player2Level: "0",
      player2Name: "player name 2",
      scoreCap: "Low (1000)",
      startMoney: "750",
      timeLimit: "40 minutes : 0 seconds",
      winner: { DiscordUID: "678678", EugenUID: "678678" }
    });
  });
});
