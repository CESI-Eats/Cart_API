import {Request, Response} from 'express';
import Cart from '../models/cart';
import mongoose from "mongoose";

// Get specific one
export const getCartByClientId = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findOne({userId: req.body.clientId});
        if (cart == null) {
            return res.status(404).json({message: 'Cannot find cart'});
        }
        res.status(200).json(cart);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(500).json({message: errMessage});
    }
};

// Create
export const createCart = async (req: Request, res: Response) => {
    try {
        const existingCart = await Cart.findOne({userId: req.body.userId});
        if (existingCart) {
            return res.status(400).send({message: 'User already has a cart'});
        }

        const cart = new Cart({
            id: new mongoose.Types.ObjectId(),
            userId: req.body.userId,
            menus: [],
            price: 0
        });

        const result = await cart.save();
        res.status(201).json(result);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(400).json({message: errMessage});
    }
};

// Update
export const updateCartByClientId = async (req: Request, res: Response) => {
    const {price, menus, clientId} = req.body;

    try {

        const cart = await Cart.findOne({userId: req.body.clientId});
        if (cart == null) {
            return res.status(404).json({message: 'Cannot find cart'});
        }

        const updatedCart = await Cart.findByIdAndUpdate(req.params.id, {
            price: price,
            menus: menus,
            clientId: clientId
        }, {new: true});

        if (updatedCart == null) {
            return res.status(404).json({message: 'Cannot find cart'});
        }

        res.status(200).json({
            message: 'Cart updated',
            cart: updatedCart
        });
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
};

// Delete
export const deleteCartByClientId = async (req: Request, res: Response) => {
    try {
        await Cart.findOneAndDelete({userId: req.body.clientId});
        res.status(200).json({message: 'Cart deleted'});
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(500).json({message: errMessage});
    }
};
