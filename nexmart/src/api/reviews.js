import { del, get, post } from './client.js';

export const getReviews    = (productId)       => get(`/products/${productId}/reviews`);
export const postReview    = (productId, data) => post(`/products/${productId}/reviews`, data);
export const deleteReview  = (reviewId)        => del(`/reviews/${reviewId}`);
