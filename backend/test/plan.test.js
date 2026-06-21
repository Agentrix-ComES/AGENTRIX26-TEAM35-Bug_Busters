const request = require('supertest');
const express = require('express');
const planRoute = require('../api/plan/index');

const app = express();
app.use(express.json());
app.use('/api', planRoute);

describe('POST /api/plan', () => {
    it('should return a 200 OK and valid pipeline response', async () => {
        const payload = {
            familySize: 4,
            budget: 15000,
            dietPreference: 'halal',
            pantryItems: ['rice', 'onion'],
            location: 'Colombo'
        };

        const response = await request(app)
            .post('/api/plan')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('workflow');
        expect(response.body).toHaveProperty('priceContext');
        expect(response.body).toHaveProperty('mealPlan');
        expect(response.body).toHaveProperty('shoppingList');
        expect(response.body).toHaveProperty('vendorTable');
        expect(response.body).toHaveProperty('totalEstimatedCost');
        expect(response.body).toHaveProperty('estimatedSavings');

        // Check specific workflow agent inclusion
        expect(response.body.workflow).toContain("Supervisor Agent");
    });
});
