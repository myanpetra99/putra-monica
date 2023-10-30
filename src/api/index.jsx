import axios from 'axios';

const BaseURL = 'https://go-wedding-api-myanpetra99.vercel.app'

const getWeddingWishes = async (weddingId) => {
    try {
        if (weddingId === undefined || weddingId === null || weddingId === '') {
            weddingId = '1';
        }
        const response = await axios.get(`${BaseURL}/wedding/${weddingId}/messages`);
        return response
    } catch (error) {
        console.error('Error fetching wedding wishes:', error);
    }
}

const postWeddingWish = async (weddingId, name, message) => {
    if (weddingId === undefined || weddingId === null || weddingId === '') {
        weddingId = '1';
    }
    try {
        const response = await axios.post(`${BaseURL}/wedding/${weddingId}/messages`, {
            name: name,
            message: message
        });
        return response
    } catch (error) {
        console.error('Error posting a wedding wish:', error);
    }
}

const getWeddingRSVPs = async (weddingId) => {
    if (weddingId === undefined || weddingId === null || weddingId === '') {
        weddingId = '1';
    }
    try {
        const response = await axios.get(`${BaseURL}/wedding/${weddingId}/rsvp`);
        return response
    } catch (error) {
        console.error('Error fetching RSVPs:', error);
    }
}

 const postWeddingRSVP = async (weddingId, name, attendance) => {
    if (weddingId === undefined || weddingId === null || weddingId === '') {
        weddingId = '1';
    }
    const response = await axios.post(`${BaseURL}/wedding/${weddingId}/rsvp`, {
        Name: name,
        Attendance: attendance
    });
    return response;
}

export {
    postWeddingRSVP,
    getWeddingWishes,
    postWeddingWish,
    getWeddingRSVPs
};
