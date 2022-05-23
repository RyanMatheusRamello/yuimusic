module.exports = class RemoveRole extends Command {

    constructor(client){

        super(client, {
            name: "removerole",
            description: "Remove um cargo na WhiteList",
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
            let roles = [];
            for(let _role of cog.allowRole){
                if(_role != role.id)
                    roles.push(_role);
            }
            if(cog.allowRole.length === roles.length){
                return await interaction.editReply("Esse cargo não está na whiteList");
            }
            cog.allowRole = roles;
            await cog.save();
            return await interaction.editReply("Configuração alterada com sucesso");
        }
        cog = new DB.Config({
            guildId: interaction.guild.id,
            musicChannel: "",
            messageId: "",
            allowRole: []
        });
        await cog.save();
        return await interaction.editReply("Esse cargo não está na whiteList");

    }

}