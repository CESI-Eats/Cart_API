import {handleTopic, initExchange, initQueue, MessageLapinou, publishTopic} from "../services/lapinouService";
import Cart from "../models/cart";

export function createCartsExchange() {
    initExchange('carts').then(exchange => {
        initQueue(exchange, 'get.cart').then(({ queue, topic }) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const cart = await Cart.findOne({ userId: message.content.id });
                    if (cart == null) {
                        throw new Error('Cannot find cart');
                    }
                    // Return the cart object as the response
                    const response: MessageLapinou = {
                        success: true,
                        content: cart,
                        correlationId: message.correlationId,
                        replyTo: message.replyTo
                    };
                    await publishTopic('carts', `${message.replyTo}.reply`, response);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    console.error(errMessage);
                }
            });
        });
        initQueue(exchange, 'add.to.cart').then(({ queue, topic }) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const cart = await Cart.findOne({ userId: message.content.id });
                    if (cart == null) {
                        throw new Error('Cannot find cart');
                    }
                    // Add message.content.menu.id to cart.menus list
                    cart.menus.push(message.content.menu.id);

                    // Add message.content.menu.amount to cart.price
                    cart.price += message.content.menu.amount;

                    // Update the cart
                    await cart.save();

                    // Return the updated cart object as the response
                    const response: MessageLapinou = {
                        success: true,
                        content: cart,
                        correlationId: message.correlationId,
                        replyTo: message.replyTo
                    };
                    await publishTopic('carts', `${message.replyTo}.reply`, response);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    console.error(errMessage);
                }
            });
        });
        initQueue(exchange, 'remove.to.cart').then(({ queue, topic }) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const cart = await Cart.findOne({ userId: message.content.id });
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
                    await publishTopic('carts', `${message.replyTo}.reply`, response);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    console.error(errMessage);
                }
            });
        });
    });
}
