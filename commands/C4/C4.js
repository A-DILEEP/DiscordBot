import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export const activeC4Games = new Map();

const EMOJI = {
  R: "🔴",
  Y: "🟡",
  E: "⚪", 
  WIN_R: "💖",
  WIN_Y: "⭐",
};

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

function renderBoard(board, winCells = []) {
  let out = "";

  for (let r = 5; r >= 0; r--) {
    for (let c = 0; c < 7; c++) {
      const isWin = winCells.some(([wc, wr]) => wc === c && wr === r);

      if (board[c][r] === "R") {
        out += isWin ? EMOJI.WIN_R : EMOJI.R;
      } else if (board[c][r] === "Y") {
        out += isWin ? EMOJI.WIN_Y : EMOJI.Y;
      } else {
        out += EMOJI.E;
      }
    }
    out += "\n";
  }

  out += "1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣";
  return out;
}

function findWin(board, d) {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (let c = 0; c < 7; c++) {
    for (let r = 0; r < 6; r++) {
      if (board[c][r] !== d) continue;

      for (const [dc, dr] of dirs) {
        const cells = [[c, r]];

        for (let i = 1; i < 4; i++) {
          const nc = c + dc * i;
          const nr = r + dr * i;

          if (nc < 0 || nc >= 7 || nr < 0 || nr >= 6 || board[nc][nr] !== d) {
            break;
          }
          cells.push([nc, nr]);
        }

        if (cells.length === 4) return cells;
      }
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every((col) => col.every((cell) => cell !== null));
}

function buildColumnButtons() {
  const rows = [];
  let currentRow = new ActionRowBuilder();

  for (let i = 0; i < 7; i++) {
    const btn = new ButtonBuilder()
      .setCustomId(`c4_col_${i}`)
      .setLabel((i + 1).toString())
      .setStyle(ButtonStyle.Primary);

    if (currentRow.components.length === 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
    currentRow.addComponents(btn);
  }

  rows.push(currentRow);
  return rows;
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
        content: "❌ A game is already running here.",
        ephemeral: true,
      });
    }

    activeC4Games.set(channelId, {
      player1: interaction.user.id,
      player2: opponent.id,
      currentTurn: null,
      board: null,
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
      content: `🎮 **Connect 4 Challenge**\n${interaction.user} vs ${opponent}\n\n${opponent}, accept?`,
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

    game.board = createEmptyBoard();
    game.currentTurn = game.player1;

    return interaction.update({
      content: renderBoard(game.board) + `\n\n🔴 <@${game.player1}> starts!`,
      components: buildColumnButtons(),
    });
  }

  if (!interaction.customId.startsWith("c4_col_")) return;

  if (interaction.user.id !== game.currentTurn) {
    return interaction.reply({ content: "❌ Not your turn!", ephemeral: true });
  }

  const col = Number(interaction.customId.split("_")[2]);
  const disc = game.currentTurn === game.player1 ? "R" : "Y";

  if (dropDisc(game.board, col, disc) === -1) {
    return interaction.reply({ content: "❌ Column full!", ephemeral: true });
  }

  const winCells = findWin(game.board, disc);

  if (winCells) {
    activeC4Games.delete(interaction.channelId);

    await interaction.update({
      content: renderBoard(game.board, winCells),
      components: [],
    });

    const winEmbed = new EmbedBuilder()
      .setTitle("🎉 WE HAVE A WINNER!")
      .setDescription(`👑 **Champion:** <@${interaction.user.id}>`)
      .setColor(disc === "R" ? 0xed4245 : 0xf1c40f)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.followUp({ embeds: [winEmbed] });
    return;
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
