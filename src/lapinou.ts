import { createOrderingExchange } from './exchanges/orderingExchange';
import { connectLapinou } from './services/lapinouService';

export function initLapinou(){
    connectLapinou().then(async () => {
        createOrderingExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}
