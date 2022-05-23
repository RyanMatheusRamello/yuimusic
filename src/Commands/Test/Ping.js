module.exports = class Ping extends Command {

    constructor(client){

        super(client, {
            name: "ping",
            description: "Verifica se o bot está online"
        });

    }

    exec = (interaction) => {

        return interaction.reply({ content: `:ping_pong: Pong!\n:zap: PING: \`${interaction.client.ws.ping}ms\``, ephemeral: true });

    }

}