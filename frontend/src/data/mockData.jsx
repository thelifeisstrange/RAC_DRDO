// src/data/mockData.jsx

// This file acts as our single source of truth for mock data, just like a database.

export const initialUsers = [
    { id: 1, name: 'Rohan Sharma', email: 'rohan.s@email.com', role: 'Screening Member', password: 'password123' },
    { id: 2, name: 'Priya Singh', email: 'priya.s@email.com', role: 'Screening Member', password: 'password123' },
    { id: 3, name: 'Amit Karva', email: 'amit.k@email.com', role: 'Applicant', password: 'password123' }, // Note: Using email as name for simplicity
    { id: 4, name: 'Archita Yadav' , email: 'archita.y@email.com', role: 'Admin', password: 'password123' },
    { id: 5, name: 'Rushan Shaikh', email: 'stanley_1337@meta.com', role: 'Admin', password: 'password123' },
];

export const initialRoles = ['Admin', 'Screening Member', 'Applicant'];