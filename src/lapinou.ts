import { createOrderingExchange } from './exchanges/orderingExchange';
import {createCartsExchange} from "./exchanges/cartsExchange";
import { connectLapinou } from './services/lapinouService';

export function initLapinou(){
    connectLapinou().then(async () => {
        createOrderingExchange();
        createCartsExchange();
    });
}
