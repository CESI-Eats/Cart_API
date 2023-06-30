import { MessageLapinou, handleTopic, initExchange, initQueue, publishTopic, receiveResponses, sendMessage } from "../services/lapinouService";
import { v4 as uuidv4 } from 'uuid';
import Cart from "../models/cart";

export function createOrderingExchange() {
    initExchange('ordering').then(exchange => {
        initQueue(exchange, 'submit.cart').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);


                const cart = await Cart.findOne({_idUser: message.content._idIdentity});

                if (!cart) {
                    throw new Error('Cart not found');
                }

                const replyQueue = 'create.order.reply';
                const correlationId = uuidv4();
                const orderMessage: MessageLapinou = {
                    success: true,
                    content: {
                        _idIdentity: message.content._idIdentity,
                        amount: cart.price,
                        mode: message.content.mode,
                        _idMenus: cart.menus,
                        _idRestorer: cart._idRestorer
                    },
                    correlationId: correlationId,
                    replyTo: replyQueue
                }
                await publishTopic('ordering', 'create.order', orderMessage);
                const responses = await receiveResponses(replyQueue, correlationId, 1);
                if(responses.length === 0 || !responses[0].success) {
                    throw new Error('Payment failed');
                }

                await sendMessage({success: true, content: null, correlationId: message.correlationId, sender: 'cart'}, message.replyTo??'');
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'cart'}, message.replyTo??'');
                }
            });
        });
        initQueue(exchange, 'order.submitted').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);

                const cart = await Cart.findOne({_idUser: message.content._idUser});

                if (!cart) {
                    throw new Error('Cart not found');
                }
                cart._idRestorer = '';
                cart.menus = [];
                cart.price = 0;
                await cart.save();
                console.log('Cart cleared');
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    console.error(errMessage);
                }
            });
        });
    });
}