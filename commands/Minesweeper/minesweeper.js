import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

const activeGames = new Map();

function createEmptyBoard(size) {
  const board = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push({ mine: false, adjacent: 0 });
    }
    board.push(row);
  }
  return board;
}

function placeMines(board, mines) {
  const size = board.length;
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
}

function computeAdjacents(board) {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (board[nr][nc].mine) count++;
          }
        }
      }
      board[r][c].adjacent = count;
    }
  }
}

function floodReveal(game, r, c) {
  const size = game.size;
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    const key = `${cr},${cc}`;
    if (game.revealed.has(key) || game.flagged.has(key)) continue;
    game.revealed.add(key);
    const cell = game.board[cr][cc];
    if (cell.adjacent === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const nkey = `${nr},${nc}`;
            if (!game.revealed.has(nkey) && !game.flagged.has(nkey)) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
  }
}

function buildComponents(gameId, game) {
  const rows = [];
  for (let r = 0; r < game.size; r++) {
    const actionRow = new ActionRowBuilder();
    for (let c = 0; c < game.size; c++) {
      const key = `${r},${c}`;
      let button;
      if (game.revealed.has(key)) {
        const cell = game.board[r][c];
        const label = cell.mine
          ? "💣"
          : cell.adjacent === 0
            ? "0"
            : String(cell.adjacent);
        button = new ButtonBuilder()
          .setCustomId(`ms:${gameId}:${r}:${c}`)
          .setLabel(label)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);
      } else if (game.flagged.has(key)) {
        button = new ButtonBuilder()
          .setCustomId(`ms:${gameId}:${r}:${c}`)
          .setLabel("🚩")
          .setStyle(ButtonStyle.Danger);
      } else {
        button = new ButtonBuilder()
          .setCustomId(`ms:${gameId}:${r}:${c}`)
          .setLabel("⬜")
          .setStyle(ButtonStyle.Primary);
      }
      actionRow.addComponents(button);
    }
    rows.push(actionRow);
  }

  const controlRow = new ActionRowBuilder();
  const flagBtn = new ButtonBuilder()
    .setCustomId(`ms_flag:${gameId}`)
    .setLabel(game.flagMode ? "Flag: ON" : "Flag: OFF")
    .setStyle(game.flagMode ? ButtonStyle.Success : ButtonStyle.Secondary);
  const stopBtn = new ButtonBuilder()
    .setCustomId(`ms_stop:${gameId}`)
    .setLabel("Stop")
    .setStyle(ButtonStyle.Danger);
  controlRow.addComponents(flagBtn, stopBtn);
  rows.push(controlRow);

  return rows;
}

export default {
  data: new SlashCommandBuilder()
    .setName("minesweeper")
    .setDescription("Play a small Minesweeper game")
    .addIntegerOption((opt) =>
      opt
        .setName("size")
        .setDescription("Grid size (2-4). Default 4")
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(4),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("mines")
        .setDescription("Number of mines (1 - size*size-1). Default size")
        .setRequired(false),
    ),

  async execute(interaction) {
    const size = interaction.options.getInteger("size") || 4;
    const mines =
      interaction.options.getInteger("mines") ||
      Math.max(1, Math.floor((size * size) / 4));

    const gameId = Math.random().toString(36).slice(2, 9);
    const board = createEmptyBoard(size);
    const mineCount = Math.max(1, Math.min(mines, size * size - 1));
    placeMines(board, mineCount);
    computeAdjacents(board);

    const game = {
      owner: interaction.user.id,
      size,
      mines: mineCount,
      board,
      revealed: new Set(),
      flagged: new Set(),
      flagMode: false,
      startTime: Date.now(),
      finished: false,
    };

    activeGames.set(gameId, game);

    const embed = new EmbedBuilder()
      .setTitle(`Minesweeper (${size}x${size} - ${mineCount} mines)`)
      .setDescription(
        "Click tiles to reveal. Toggle flag mode to place/remove flags.",
      )
      .setColor(0x5865f2);

    const components = buildComponents(gameId, game);

    const replyMsg = await interaction.reply({
      embeds: [embed],
      components,
      fetchReply: true,
    });

    const collector = replyMsg.createMessageComponentCollector({
      time: 10 * 60 * 1000,
    });

    collector.on("collect", async (btnInt) => {
      if (game.finished) return;
      const userId = btnInt.user.id;
      if (userId !== game.owner) {
        await btnInt.reply({
          content: "Only the game starter can interact with this board.",
          ephemeral: true,
        });
        return;
      }

      const cid = btnInt.customId;
      if (cid.startsWith(`ms_stop:${gameId}`)) {
        game.finished = true;
        collector.stop();
        embed.setDescription("Game stopped.");
        for (let r = 0; r < game.size; r++) {
          for (let c = 0; c < game.size; c++) {
            if (game.board[r][c].mine) game.revealed.add(`${r},${c}`);
          }
        }
        await replyMsg.edit({
          embeds: [embed],
          components: buildComponents(gameId, game),
        });
        await btnInt.reply({ content: "Game stopped.", ephemeral: true });
        return;
      }

      if (cid.startsWith(`ms_flag:${gameId}`)) {
        game.flagMode = !game.flagMode;
        await replyMsg.edit({ components: buildComponents(gameId, game) });
        await btnInt.reply({
          content: `Flag mode ${game.flagMode ? "enabled" : "disabled"}.`,
          ephemeral: true,
        });
        return;
      }

      if (cid.startsWith(`ms:${gameId}:`)) {
        const parts = cid.split(":");
        const r = parseInt(parts[2], 10);
        const c = parseInt(parts[3], 10);
        const key = `${r},${c}`;

        if (game.flagMode) {
          if (game.revealed.has(key)) {
            await btnInt.reply({
              content: "Cannot flag a revealed tile.",
              ephemeral: true,
            });
            return;
          }
          if (game.flagged.has(key)) game.flagged.delete(key);
          else game.flagged.add(key);
          await replyMsg.edit({ components: buildComponents(gameId, game) });
          await btnInt.reply({ content: "Flag toggled.", ephemeral: true });
          return;
        }

        if (game.flagged.has(key)) {
          await btnInt.reply({
            content: "Tile is flagged. Disable flag mode to reveal.",
            ephemeral: true,
          });
          return;
        }

        if (game.board[r][c].mine) {
          game.finished = true;
          for (let rr = 0; rr < game.size; rr++) {
            for (let cc = 0; cc < game.size; cc++) {
              if (game.board[rr][cc].mine) game.revealed.add(`${rr},${cc}`);
            }
          }
          await replyMsg.edit({
            embeds: [embed.setDescription("💥 You hit a mine! Game over.")],
            components: buildComponents(gameId, game),
          });
          collector.stop();
          await btnInt.reply({
            content: "You hit a mine! Game over.",
            ephemeral: true,
          });
          return;
        }

        floodReveal(game, r, c);

        let revealedCount = 0;
        for (let rr = 0; rr < game.size; rr++) {
          for (let cc = 0; cc < game.size; cc++) {
            const k = `${rr},${cc}`;
            if (game.revealed.has(k)) revealedCount++;
          }
        }
        const totalSafe = game.size * game.size - game.mines;
        if (revealedCount >= totalSafe) {
          game.finished = true;
          collector.stop();
          embed.setDescription("🎉 You cleared the board! You win!");
          await replyMsg.edit({
            embeds: [embed],
            components: buildComponents(gameId, game),
          });
          await btnInt.reply({
            content: "You cleared the board! Congratulations!",
            ephemeral: true,
          });
          return;
        }

        await replyMsg.edit({ components: buildComponents(gameId, game) });
      }
    });

    collector.on("end", async () => {
      activeGames.delete(gameId);
      if (!game.finished) {
        embed.setDescription("Game timed out.");
        for (let r = 0; r < game.size; r++) {
          for (let c = 0; c < game.size; c++) {
            if (game.board[r][c].mine) game.revealed.add(`${r},${c}`);
          }
        }
        try {
          await replyMsg.edit({
            embeds: [embed],
            components: buildComponents(gameId, game),
          });
        } catch (e) {
          console.error("Failed to edit message on collector end:", e);
        }
      }
    });
  },
};
