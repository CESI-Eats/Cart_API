import { createOrderingExchange } from './exchanges/orderingExchange';
import {createCartsExchange} from "./exchanges/cartsExchange";
import { connectLapinou } from './services/lapinouService';

export function initLapinou(){
    connectLapinou().then(async () => {
        createOrderingExchange();
        createCartsExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}
