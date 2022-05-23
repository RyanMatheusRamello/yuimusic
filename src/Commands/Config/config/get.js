module.exports = class Ping extends Command {

    constructor(client){

        super(client, {
            name: "get",
            description: "Retorna a configuração do servidor",
            config: {
                permissions: ["MANAGE_GUILD"]
            },
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction) => {

        let cog = await DB.Config.findOne({ guildId: interaction.guild.id });
        if(!cog){
            cog = new DB.Config({
                guildId: interaction.guild.id,
                musicChannel: "",
                messageId: "",
                allowRole: []
            });
            await cog.save();
        }
        return await interaction.editReply(`${this.builder.blockCode({ lang:"json", code: JSON.stringify({
            id: interaction.guild.id,
            musicChannel: cog.musicChannel,
            messageId: cog.messageId,
            allowRole: (cog.allowRole.length === 0 ? ["@everyone"] : cog.allowRole)
        }, null, 4)})}`);

    }

}