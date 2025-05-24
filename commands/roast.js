import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Roasts the mentioned user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who gets roasted?")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");

    if(user.id===interaction.user.id){
      return interaction.reply("You need help to roast yourself ? seriously broo ?! ");
    }

    if(user.id===interaction.client.user.id){
      return interaction.reply("Nah i am not gonna roast myself, i am too cute for that 😘");
    }

    const roasts = [
      "You're not stupid; you just have bad luck thinking.",
      "Your secrets are safe with me. I never even listen when you talk.",
      "You're like a cloud. When you disappear, it's a beautiful day.",
      "I'd agree with you but then we'd both be wrong.",
      "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
      "You have the right to remain silent because whatever you say will probably be stupid anyway.",
      "You're proof that evolution can go in reverse.",
      "If laughter is the best medicine, your face must be curing the world.",
      "You're as useless as the 'ueue' in 'queue'.",
      "If I threw a stick, you'd leave, right?",
      "You bring everyone so much joy when you leave the room.",
      "I'd explain it to you, but I don't have any crayons.",
      "You're the reason the gene pool needs a lifeguard.",
      "You have the perfect face for radio.",
      "Somewhere out there is a tree tirelessly producing oxygen for you. You owe it an apology.",
      "You are the human version of a participation trophy.",
      "If I had a face like yours, I'd sue my parents.",
      "You're not the dumbest person on the planet, but you better hope they don't die.",
      "You have the charm and personality of a dial-up modem.",
      "If ignorance is bliss, you must be the happiest person alive.",
      "You're like a slinky: not really good for anything, but you bring a smile when pushed down the stairs.",
      "Your family tree must be a cactus because everyone on it is a prick.",
      "You have two brains cells, and they're both fighting for third place.",
      "You're as sharp as a marble.",
      "You are the reason we have warning labels.",
      "If I wanted to hear from someone with no brains, I'd talk to a potato.",
      "You couldn't pour water out of a boot if the instructions were on the heel.",
      "You're as useless as a screen door on a submarine.",
      "If you were any more dense, black holes would orbit you.",
      "You have the personality of wet cardboard.",
      "You're the reason shampoo has instructions.",
      "I'd call you a tool, but even they serve a purpose.",
      "You're about as helpful as a white crayon.",
      "You have the emotional range of a teaspoon.",
      "If you were any more basic, you'd be a pH of 14.",
      "You're like a software update: whenever I see you, I think, 'Not now.'",
      "You're the human equivalent of a typo.",
      "If you were a vegetable, you'd be a 'cabbage'.",
      "You're as bright as a black hole and twice as dense.",
      "You have the social skills of a dial tone.",
      "You're the reason we can't have nice things.",
      "If you were any slower, you'd be going backwards.",
      "You're as useless as a knitted condom.",
      "You have the charisma of a damp rag.",
      "You're the human version of a 404 error.",
      "If you were any more annoying, you'd be a pop-up ad.",
      "You're as welcome as a rattlesnake at a square dance.",
      "You have the fashion sense of a scarecrow.",
      "You're the human equivalent of a participation ribbon.",
      "If you were a fruit, you'd be a 'lemon'.",
      "You're as sharp as a bowling ball.",
      "You have the energy of a broken solar panel.",
      "You're the human version of a software bug.",
      "If you were any more forgettable, you'd be a password I made up last week.",
      "You're as useful as a chocolate teapot.",
      "You have the wit of a slow-loading webpage.",
      "You're the human equivalent of a printer jam.",
      "If you were any more awkward, you'd be a left-handed screwdriver.",
      "You're as inspiring as a Monday morning.",
      "You have the presence of a ghost in daylight.",
      "You're the human version of a buffering video.",
      "If you were any more bland, you'd be plain toast.",
      "You're as interesting as watching paint dry.",
      "You have the enthusiasm of a sloth on a lazy day.",
      "You're the human equivalent of a dropped call.",
      "If you were any more transparent, you'd be a window.",
      "You're as original as a stock photo.",
      "You have the creativity of a broken record.",
      "You're the human version of a missed call.",
      "If you were any more basic, you'd be a default setting.",
      "You're as memorable as yesterday's lunch.",
      "You have the subtlety of a sledgehammer.",
      "You're the human equivalent of a loading screen.",
      "If you were any more predictable, you'd be a sunrise.",
      "You're as exciting as a tax return.",
      "You have the timing of a broken clock.",
      "You're the human version of a spam email.",
      "If you were any more out of touch, you'd be a landline.",
      "You're as coordinated as a giraffe on roller skates.",
      "You have the depth of a puddle.",
      "You're the human equivalent of a pop quiz.",
      "If you were any more lost, you'd need Google Maps.",
      "You're as comforting as a cold toilet seat.",
      "You have the logic of a conspiracy theory.",
      "You're the human version of a dead battery.",
      "If you were any more disappointing, you'd be a flat soda.",
      "You're as reliable as a weather forecast.",
      "You have the subtlety of a fire alarm.",
      "You're the human equivalent of a parking ticket.",
      "If you were any more out of place, you'd be a penguin in the desert.",
      "You're as organized as a tornado.",
      "You have the focus of a goldfish.",
      "You're the human version of a missed delivery.",
      "If you were any more random, you'd be a dice roll.",
      "You're as effective as a screen door on a spaceship.",
      "You have the warmth of a snowman.",
      "You're the human equivalent of a blank page.",
      "If you were any more confusing, you'd be a plot twist.",
      "You're as trustworthy as a phishing email.",
      "You have the optimism of a pessimist.",
      "You're the human version of a system crash.",
      "If you were any more extra, you'd be a bonus level.",
      "You're as subtle as a marching band at midnight.",
      "You have the grace of a falling brick.",
      "You're the human equivalent of a blue screen of death."
    ];
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await interaction.reply(`${user}, ${roast}`);
  },
};
