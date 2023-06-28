import { createOrderingExchange } from './exchanges/orderingExchange';
import {createCartsExchange} from "./exchanges/cartsExchange";
import { connectLapinou } from './services/lapinouService';
import {createUsersExchange} from "./exchanges/usersExchange";

export function initLapinou(){
    connectLapinou().then(async () => {
        createOrderingExchange();
        createCartsExchange();
        createUsersExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}
