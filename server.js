const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; 
app.use(bodyParser.json());


// Route to handle POST requests from Dialogflow
app.post('/webhook', async (req, res) => {
    const requestBody = req.body;

    if (!requestBody) {
        return res.status(400).send('Error: Empty request body');
    }

    const orderId = requestBody.queryResult.parameters.number;

    if (!orderId) {
        return res.status(400).send('Error: Order ID is missing');
    }

    try {
        const shipmentDate = await fetchShipmentDate(orderId);

        if (!shipmentDate) {
            return res.status(500).send('Error: Failed to fetch shipment date');
        }

        const responseMessage = `Your Order ${orderId} will be delivered ${shipmentDate}`;

        const response = {
            fulfillmentText: responseMessage
        };

        return res.json(response);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
});

async function fetchShipmentDate(orderId) {
    const apiUrl = 'https://orderstatusapi-dot-organization-project-311520.uc.r.appspot.com/api/getOrderStatus';
    const payload = { orderId };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        const responseData = await response.json();
        const ShipmentDate = responseData.shipmentDate;
        const shipmentDate = new Date(ShipmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        return shipmentDate;
    } else {
        return null;
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});