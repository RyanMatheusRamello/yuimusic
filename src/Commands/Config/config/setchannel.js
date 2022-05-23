const { MessageEmbed } = require("discord.js");

module.exports = class SetChannel extends Command {

    constructor(client){

        super(client, {
            name: "setchannel",
            description: "Define o canal atual como o canal de pedido de música, toda mensagem será interpretada como pedido",
            config: {
                permissions: ["MANAGE_GUILD"],
                botPermissions: ["EMBED_LINKS", "MANAGE_MESSAGES"]
            },
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction) => {

        // Verificar se já está configurado
        let cog = await DB.Config.findOne({ guildId: interaction.guild.id });

        let embed = new MessageEmbed()
            .setTitle("Query List")
            .setDescription(`Sem músicas tocando agora`)
            .setColor(this.client.embedColor)
            .setThumbnail(this.client.user.displayAvatarURL())
            .setImage("https://media.discordapp.net/attachments/978102184854032385/978102256689877022/yui-image.jpg?width=288&height=180");
        let obj = {}
        obj.embeds = [embed]
        if(cog){
            // Mandar a mensagem e Atualizar os dados
            let message = await interaction.channel.send(obj);
            cog.guildId = interaction.guild.id;
            cog.musicChannel = interaction.channel.id,
            cog.messageId = message.id,
            await cog.save();
            return await interaction.editReply("Configuração alterada com sucesso");
        }
        
        let message = await interaction.channel.send(obj);
        cog = new DB.Config({
            guildId: interaction.guild.id,
            musicChannel: interaction.channel.id,
            messageId: message.id
        });
        await cog.save();
        return await interaction.editReply("Configuração criada com sucesso");

    }

}