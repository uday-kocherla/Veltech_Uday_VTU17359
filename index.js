const express = require('express');
const axios = require('axios');

const app = express();

app.get('/numbers', async (req, res) => {
    const urls = req.query.url || [];
    const validatedUrls = urls.filter(url => UrlValidation(url));

    const promises = validatedUrls.map(fetchNumbers);

    try {
        const responses = await Promise.allSettled(promises);
        let mergedNumbers = [];

        responses.forEach(response => {
            if (response.status === 'fulfilled') {
                mergedNumbers = mergedNumbers.concat(response.value);
            }
        });

        const uniqueNumbers = [...new Set(mergedNumbers)];
        const sortedNumbers = uniqueNumbers.sort((a, b) => a - b);

        res.json({ numbers: sortedNumbers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function UrlValidation(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

async function fetchNumbers(url) {
    try {
        const response = await axios.get(url, { timeout: 500 });
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error in fetching numbers`);
        return [];
    }
}

app.listen(5000, () => {
    console.log(`Server is running`);
});
