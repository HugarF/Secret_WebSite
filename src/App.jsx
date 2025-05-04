import React, {useState, useEffect} from 'react';
import './App.css';
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import '@fortawesome/fontawesome-free/js/all.js';

function App() {
    // Исправленный массив категорий
    const categories = [
        {
            name: 'Анкеты',
            subcategories: ['Ваши анкеты', 'Премиум услуги', 'СМС-Услуги', 'Проверка фото', 'Номера телефонов', 'Публикация в Телеграмм', 'dkpkpo', 'skodwokw', 'dkdkpo', 'sodwokw', 'dkpwdkpo', 'skodwokw',]
        },
        {name: 'Info', subcategories: ['Лжесотрудники', 'Пробивка', 'Админ форум']},
    ];

    return (
        <BrowserRouter>
        <div id="App">
            <header>
                <nav>
                    <ul className="categories">
                        {categories.map((category, index) => (
                            <li key={index} className="category">
                                <button>{category.name}</button>
                                <ul className="subcategories">
                                    {category.subcategories.map((sub, subIndex) => (
                                        <li key={subIndex}>
                                            <a href="#">{sub}</a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </nav>
                <nav>
                    <Link to="/profile" className="user-icon">
                        <i className="fas fa-circle-user"></i>
                    </Link>
                </nav>
            </header>

        </div>
</BrowserRouter>
    );
}

export default App;