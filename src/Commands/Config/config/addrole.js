module.exports = class Ping extends Command {

    constructor(client){

        super(client, {
            name: "addrole",
            description: "Adiciona um cargo na WhiteList",
            config: {
                permissions: ["MANAGE_GUILD"]
            },
            options: [
                {
                    type: "ROLE",
                    name: "role",
                    description: "Cargo que vai ser permitido interagir na YuiBot",
                    required: true
                }
            ],
            deferReply: true,
            deferEphemeral: true
        });

    }

    exec = async (interaction, { role }) => {

        if(!interaction.guild.roles.cache.get(role.id)){
            return await interaction.editReply("Cargo não encontrado");
        }
        // Verificar se já está configurado
        let cog = await DB.Config.findOne({ guildId: interaction.guild.id });
        if(cog){
            cog.allowRole.push(role.id);
            await cog.save();
            return await interaction.editReply("Configuração alterada com sucesso");
        }
        cog = new DB.Config({
            guildId: interaction.guild.id,
            musicChannel: "",
            messageId: "",
            allowRole: [role.id]
        });
        await cog.save();
        return await interaction.editReply("Configuração criada com sucesso");

    }

}