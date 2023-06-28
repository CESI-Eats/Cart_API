import {
    handleTopic,
    initExchange,
    initQueue,
    MessageLapinou,
    publishTopic,
    sendMessage
} from "../services/lapinouService";
import Cart from "../models/cart";

export function createUsersExchange() {
    initExchange('users').then(exchange => {
        initQueue(exchange, 'create.user.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);

                    const cart = new Cart({
                        _idUser: message.content.id,
                        _idRestorer: '',
                        menus: [],
                        price: 0
                    })
                    await cart.save();

                    await sendMessage({
                        success: true,
                        content: 'Cart created',
                        correlationId: message.correlationId,
                        sender: 'cart'
                    }, message.replyTo ?? '');
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({
                        success: false,
                        content: errMessage,
                        correlationId: message.correlationId,
                        sender: 'cart'
                    }, message.replyTo ?? '');
                }
            });
        });

    });
}
