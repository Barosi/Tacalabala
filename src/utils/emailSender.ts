
import * as emailjs from '@emailjs/browser';
import { MailConfig } from '../store/useStore';
import { Order } from '../types';

export const sendOrderConfirmationEmail = async (
    config: MailConfig, 
    order: Order, 
    toEmail: string, 
    toName: string
) => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
        console.warn("EmailJS not configured, skipping confirmation email.");
        return;
    }

    const itemsList = order.items.map(i => 
        `- ${i.title} (Tg: ${i.selectedSize}) x${i.quantity} - €${Number(i.price.replace('€','')).toFixed(2)}`
    ).join('\n');

    const templateParams = {
        to_email: toEmail,
        to_name: toName,
        order_id: order.id,
        order_date: new Date().toLocaleDateString('it-IT'),
        order_items: itemsList,
        order_total: `€${order.total.toFixed(2)}`,
        shipping_address: order.shippingAddress,
        type: 'order_confirmation' // Use this in EmailJS template logic if needed
    };

    try {
        await emailjs.send(config.serviceId, config.templateId, templateParams, config.publicKey);
        console.log("Order confirmation email sent.");
    } catch (error) {
        console.error("Failed to send confirmation email", error);
    }
};

export const sendShippingConfirmationEmail = async (
    config: MailConfig,
    orderId: string,
    toEmail: string,
    toName: string,
    trackingCode: string,
    courier: string
) => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
        console.warn("EmailJS not configured, skipping shipping email.");
        return;
    }

    const templateParams = {
        to_email: toEmail,
        to_name: toName,
        order_id: orderId,
        tracking_code: trackingCode,
        courier_name: courier,
        message: `Il tuo ordine ${orderId} è stato spedito con ${courier}.`,
        type: 'shipping_confirmation'
    };

    try {
        await emailjs.send(config.serviceId, config.templateId, templateParams, config.publicKey);
        console.log("Shipping confirmation email sent.");
    } catch (error) {
        console.error("Failed to send shipping email", error);
    }
};
