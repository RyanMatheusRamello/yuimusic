module.exports = {
    // Id do servidor
    guildId: {
        type: String,
        required: true
    },
    // Id do canal no qual ta configurado para toda mensagem ser pedido de música
    musicChannel: {
        type: String,
        default: ""
    },
    messageId: {
        type: String,
        default: ""
    },
    allowRole: {
        type: Array,
        default: []
    }

}