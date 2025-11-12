
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// In-memory store for the active channel
let activeChatChannelId = null;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Sets the current channel for auto-chat mode.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {
        // This is a simple in-memory solution. For a multi-shard bot, a database would be better.
        interaction.client.activeChatChannelId = interaction.channelId;

        await interaction.reply({
            content: `This channel has been set for auto-chat. I will now respond to all messages here. To change the channel, simply use this command in another channel.`,
            ephemeral: true
        });
    },
};
