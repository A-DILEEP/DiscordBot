import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export const activeC4Games = new Map();

function createEmptyBoard() {
  return Array.from({ length: 7 }, () => Array(6).fill(null));
}

function dropDisc(board, col, disc) {
  for (let row = 0; row < 6; row++) {
    if (board[col][row] === null) {
      board[col][row] = disc;
      return row;
    }
  }
  return -1;
}

function renderBoard(board) {
  let out = "";
  for (let r = 5; r >= 0; r--) {
    for (let c = 0; c < 7; c++) {
      out += board[c][r] === "R" ? "🔴" : board[c][r] === "Y" ? "🟡" : "⚪";
    }
    out += "\n";
  }
  out += "1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣";
  return out;
}

function checkWin(board, d) {
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 6; r++)
      if (
        board[c][r] === d &&
        board[c + 1][r] === d &&
        board[c + 2][r] === d &&
        board[c + 3][r] === d
      )
        return true;
  for (let c = 0; c < 7; c++)
    for (let r = 0; r < 3; r++)
      if (
        board[c][r] === d &&
        board[c][r + 1] === d &&
        board[c][r + 2] === d &&
        board[c][r + 3] === d
      )
        return true;

  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 3; r++)
      if (
        board[c][r] === d &&
        board[c + 1][r + 1] === d &&
        board[c + 2][r + 2] === d &&
        board[c + 3][r + 3] === d
      )
        return true;

  for (let c = 0; c < 4; c++)
    for (let r = 3; r < 6; r++)
      if (
        board[c][r] === d &&
        board[c + 1][r - 1] === d &&
        board[c + 2][r - 2] === d &&
        board[c + 3][r - 3] === d
      )
        return true;

  return false;
}

function checkDraw(board) {
  return board.every((col) => col.every((cell) => cell !== null));
}

function buildColumnButtons() {
  const row = new ActionRowBuilder();
  for (let i = 0; i < 7; i++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`c4_col_${i}`)
        .setLabel((i + 1).toString())
        .setStyle(ButtonStyle.Primary),
    );
  }
  return [row];
}

export default {
  data: new SlashCommandBuilder()
    .setName("c4")
    .setDescription("Play Connect 4")
    .addSubcommand((sc) =>
      sc
        .setName("challenge")
        .setDescription("Challenge a player")
        .addUserOption((opt) =>
          opt.setName("player").setDescription("Opponent").setRequired(true),
        ),
    ),

  async execute(interaction) {
    const opponent = interaction.options.getUser("player");
    const channelId = interaction.channelId;

    if (opponent.bot || opponent.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ Invalid opponent.",
        ephemeral: true,
      });
    }

    if (activeC4Games.has(channelId)) {
      return interaction.reply({
        content: "❌ A C4 game is already running here.",
        ephemeral: true,
      });
    }

    activeC4Games.set(channelId, {
      player1: interaction.user.id,
      player2: opponent.id,
      currentTurn: null,
      board: null,
      status: "pending",
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("c4_accept")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("c4_decline")
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({
      content: `🎮 **Connect 4 Challenge!**\n${interaction.user} vs ${opponent}\n\n${opponent}, do you accept?`,
      components: [buttons],
    });
  },
};

export async function handleC4Button(interaction) {
  const game = activeC4Games.get(interaction.channelId);
  if (!game) return;

  if (interaction.customId === "c4_decline") {
    if (interaction.user.id !== game.player2) return;
    activeC4Games.delete(interaction.channelId);
    return interaction.update({
      content: "❌ Challenge declined.",
      components: [],
    });
  }

  if (interaction.customId === "c4_accept") {
    if (interaction.user.id !== game.player2) return;

    game.status = "playing";
    game.currentTurn = game.player1;
    game.board = createEmptyBoard();

    return interaction.update({
      content: renderBoard(game.board) + `\n\n🔴 <@${game.player1}> starts!`,
      components: buildColumnButtons(),
    });
  }

  if (!interaction.customId.startsWith("c4_col_")) return;

  if (interaction.user.id !== game.currentTurn) {
    return interaction.reply({
      content: "❌ Not your turn!",
      ephemeral: true,
    });
  }

  const col = Number(interaction.customId.split("_")[2]);
  const disc = game.currentTurn === game.player1 ? "R" : "Y";

  if (dropDisc(game.board, col, disc) === -1) {
    return interaction.reply({
      content: "❌ Column full!",
      ephemeral: true,
    });
  }

  if (checkWin(game.board, disc)) {
    activeC4Games.delete(interaction.channelId);
    return interaction.update({
      content:
        renderBoard(game.board) + `\n\n🏆 **<@${interaction.user.id}> wins!**`,
      components: [],
    });
  }

  if (checkDraw(game.board)) {
    activeC4Games.delete(interaction.channelId);
    return interaction.update({
      content: renderBoard(game.board) + "\n\n🤝 **It's a draw!**",
      components: [],
    });
  }

  game.currentTurn =
    game.currentTurn === game.player1 ? game.player2 : game.player1;

  return interaction.update({
    content:
      renderBoard(game.board) +
      `\n\n${
        game.currentTurn === game.player1 ? "🔴" : "🟡"
      } <@${game.currentTurn}>'s turn`,
    components: buildColumnButtons(),
  });
}
