module.exports = class InteractionCreate extends Event {

    constructor(client){

        super(client, {
            name: "interactionCreate",
        });

    }

    exec = async (interaction) => {

        //interaction.userDB = await this.client.get_user(interaction.user);
        if(interaction.isCommand()){
            let command = this.client.commands.find(e => e.name == interaction.commandName);
            if(!command){
                return await interaction.reply({ ephemeral: true, content: `Comando não encontrado`});
            }
            command.run(interaction);
        }

    }

}