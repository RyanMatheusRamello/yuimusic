module.exports = class Ready extends Event {

    constructor(client){

        super(client, {
            name: "ready"
        });

    }

    exec = (client) => {

        console.log(`${client.user.username} está online`);
        this.client.sendCommands();

    }

}