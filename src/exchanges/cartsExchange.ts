import {
    handleTopic,
    initExchange,
    initQueue,
    MessageLapinou,
    publishTopic,
    sendMessage
} from "../services/lapinouService";
import Cart from "../models/cart";

export function createCartsExchange() {
    initExchange('carts').then(exchange => {
        initQueue(exchange, 'create.cart').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);

                    const cart = new Cart({
                        _idUser: message.content.id,
                        _idRestorer: '',
                        menus:[],
                        price: 0
                    })
                    await cart.save();

                    await sendMessage({
                        success: true,
                        content: cart,
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

        initQueue(exchange, 'get.cart').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const cart = await Cart.findOne({_idUser: message.content.id});
                    if (cart == null) {
                        throw new Error('Cannot find cart');
                    }

                    await sendMessage({
                        success: true,
                        content: cart,
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
        initQueue(exchange, 'add.to.cart').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const cart = await Cart.findOne({_idUser: message.content.id});
                    if (cart == null) {
                        throw new Error('Cannot find cart');
                    }
                    if (cart._idRestorer != message.content.menu.restorerId){
                        cart.menus = [];
                        cart._idRestorer = message.content.menu.restorerId;
                    }

                    // Add message.content.menu.id to cart.menus list
                    cart.menus.push(message.content.menu.id);

                    // Add message.content.menu.amount to cart.price
                    cart.price += message.content.menu.amount;

                    // Update the cart
                    await cart.save();

                    // Return the updated cart object as the response
                    await sendMessage({
                        success: true,
                        content: cart,
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
        initQueue(exchange, 'remove.to.cart').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const cart = await Cart.findOne({_idUser: message.content.id});

                    if (cart == null) {
                        throw new Error('Cannot find cart');
                    }
                    // Remove message.content.menu.id from cart.menus list
                    const menuIndex = cart.menus.indexOf(message.content.menu.id);
                    if (menuIndex !== -1) {
                        cart.menus.splice(menuIndex, 1);
                    }

                    // Subtract message.content.menu.amount from cart.price
                    cart.price -= message.content.menu.amount;

                    // Update the cart
                    await cart.save();

                    // Return the updated cart object as the response
                    const response: MessageLapinou = {
                        success: true,
                        content: cart,
                        correlationId: message.correlationId,
                        replyTo: message.replyTo
                    };
                    await publishTopic('carts', `${message.replyTo}`, response);
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
