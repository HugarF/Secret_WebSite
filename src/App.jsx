import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Local Storage helpers for persistence
const LS_USER = 'ln_user';
const LS_ADS = 'ln_ads';

// Тестовые объявления (как будто пришли с backend)
const TEST_ADS = [
    {
        name: "Аня",
        age: 22,
        gender: "female",
        photo: "https://randomuser.me/api/portraits/women/65.jpg",
        breastSize: 3,
        description: "Горячая и страстная блондинка, воплощу ваши фантазии.",
        price1h: 5000,
        price2h: 9000,
        priceNight: 25000,
        phone: "+7 900 123-45-67"
    },
    {
        name: "Вика",
        age: 25,
        gender: "female",
        photo: "https://randomuser.me/api/portraits/women/43.jpg",
        breastSize: 4,
        description: "Элегантная и опытная, индивидуальный подход, не салон.",
        price1h: 7000,
        price2h: 13000,
        priceNight: 35000,
        phone: "+7 911 555-66-77"
    }
];

// Local Storage Save/Load for future backend compatibility
function saveUser(user) {
    localStorage.setItem(LS_USER, JSON.stringify(user));
}
function loadUser() {
    const u = localStorage.getItem(LS_USER);
    if (!u) return null;
    try { return JSON.parse(u); } catch { return null; }
}
function saveAds(ads) {
    localStorage.setItem(LS_ADS, JSON.stringify(ads));
}
function loadAds() {
    const a = localStorage.getItem(LS_ADS);
    if (!a) return null;
    try { return JSON.parse(a); } catch { return null; }
}

// Age gate
function AgeGate({ onSuccess }) {
    const [age, setAge] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (Number(age) >= 18) {
            localStorage.setItem('ln_age_verified', '1');
            onSuccess();
        } else {
            setError('Доступ разрешён только с 18 лет!');
        }
    };
    return (
        <div className="age-gate">
            <form onSubmit={handleSubmit}>
                <h2>Вам есть 18 лет?</h2>
                <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="Введите ваш возраст"
                    required
                />
                {error && <div className="gate-error">{error}</div>}
                <button type="submit">Войти</button>
            </form>
        </div>
    );
}

function Profile({ user }) {
    if (!user) {
        return <h1>Пожалуйста, войдите в систему</h1>;
    }
    return (
        <div className="profile">
            <h1>Профиль</h1>
            <img src={user.photo} alt="User" className="profile-photo" />
            <h2>{user.name}, {user.age}</h2>
            <p><strong>Пол:</strong> {user.gender}</p>
            <p><strong>Телефон:</strong> {user.phone}</p>
            {user.ad ? (
                <div className="user-ad">
                    <h3>Ваше объявление</h3>
                    <p><strong>Размер груди:</strong> {user.ad.breastSize}</p>
                    <p><strong>Описание:</strong> {user.ad.description}</p>
                    <p><strong>Цена за 1ч:</strong> {user.ad.price1h} ₽</p>
                    <p><strong>Цена за 2ч:</strong> {user.ad.price2h} ₽</p>
                    <p><strong>Цена за ночь:</strong> {user.ad.priceNight} ₽</p>
                    <p><strong>Телефон:</strong> {user.phone}</p>
                </div>
            ) : (
                <p>Вы еще не добавили объявление.</p>
            )}
        </div>
    );
}

function RegisterWindow({ onRegister }) {
    const [formData, setFormData] = useState({ name: '', age: '', gender: 'male', photo: null, phone: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, photo: URL.createObjectURL(e.target.files[0]) });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Number(formData.age) < 18) {
            setError('Для регистрации вам должно быть не менее 18 лет!');
            return;
        }
        setError('');
        onRegister(formData);
        navigate('/');
    };

    return (
        <div id="register">
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Имя"
                    title="Введите имя"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="age"
                    placeholder="Возраст (от 18)"
                    title="Введите возраст"
                    value={formData.age}
                    min={18}
                    onChange={handleInputChange}
                    required
                />
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                    <option value="trans">Транс</option>
                </select>
                <input
                    type="tel"
                    name="phone"
                    placeholder="Телефон"
                    title="Введите номер телефона"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}$"
                />
                <input
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                />
                {error && <div className="form-error">{error}</div>}
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
}

function CreateAd({ onAdSubmit, user }) {
    const [adData, setAdData] = useState({
        breastSize: 3,
        description: '',
        price1h: '',
        price2h: '',
        priceNight: ''
    });

    if (user.ad) {
        return <h2>Вы уже добавили свое объявление.</h2>;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdData({ ...adData, [name]: value });
    };

    const handleSliderChange = (e) => {
        setAdData({ ...adData, breastSize: Number(e.target.value) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdSubmit(adData);
    };

    return (
        <div id="create-ad">
            <h2>Создать объявление</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Размер груди: <span>{adData.breastSize}</span>
                    <input
                        type="range"
                        name="breastSize"
                        min="1"
                        max="5"
                        step="1"
                        value={adData.breastSize}
                        onChange={handleSliderChange}
                    />
                </label>
                <textarea
                    name="description"
                    placeholder="Описание"
                    value={adData.description}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="price1h"
                    placeholder="Цена за 1ч, ₽"
                    value={adData.price1h}
                    onChange={handleInputChange}
                    required
                    min={0}
                />
                <input
                    type="number"
                    name="price2h"
                    placeholder="Цена за 2ч, ₽"
                    value={adData.price2h}
                    onChange={handleInputChange}
                    required
                    min={0}
                />
                <input
                    type="number"
                    name="priceNight"
                    placeholder="Цена за ночь, ₽"
                    value={adData.priceNight}
                    onChange={handleInputChange}
                    required
                    min={0}
                />
                <button type="submit">Добавить объявление</button>
            </form>
        </div>
    );
}

function SidebarFilters({ filters, setFilters }) {
    return (
        <aside className="sidebar-filters">
            <h3>Фильтры</h3>
            <label>
                Возраст: <span>{filters.age || 18}+</span>
                <input
                    type="range"
                    min="18"
                    max="80"
                    value={filters.age || 18}
                    onChange={e => setFilters(f => ({ ...f, age: Number(e.target.value) }))}
                />
            </label>
            <label>
                Размер груди: <span>{filters.breastSize || 1}+</span>
                <input
                    type="range"
                    min="1"
                    max="5"
                    value={filters.breastSize || 1}
                    onChange={e => setFilters(f => ({ ...f, breastSize: Number(e.target.value) }))}
                />
            </label>
            <label>
                Цена за 1ч: от <span>{filters.price1h || 0}₽</span>
                <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={filters.price1h || 0}
                    onChange={e => setFilters(f => ({ ...f, price1h: Number(e.target.value) }))}
                />
            </label>
            <label>
                Цена за 2ч: от <span>{filters.price2h || 0}₽</span>
                <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={filters.price2h || 0}
                    onChange={e => setFilters(f => ({ ...f, price2h: Number(e.target.value) }))}
                />
            </label>
            <label>
                Цена за ночь: от <span>{filters.priceNight || 0}₽</span>
                <input
                    type="range"
                    min="0"
                    max="300000"
                    step="1000"
                    value={filters.priceNight || 0}
                    onChange={e => setFilters(f => ({ ...f, priceNight: Number(e.target.value) }))}
                />
            </label>
        </aside>
    );
}
function AdModal({ ad, onClose }) {
    if (!ad) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <img src={ad.photo} alt={ad.name} className="modal-photo" />
                <h2>{ad.name}, {ad.age}</h2>
                <p><strong>Пол:</strong> {ad.gender}</p>
                <p><strong>Размер груди:</strong> {ad.breastSize}</p>
                <p><strong>Описание:</strong> {ad.description}</p>
                <div className="modal-prices">
                    <p><strong>1ч:</strong> {ad.price1h} ₽</p>
                    <p><strong>2ч:</strong> {ad.price2h} ₽</p>
                    <p><strong>Ночь:</strong> {ad.priceNight} ₽</p>
                </div>
                <a className="call-btn" href={`tel:${ad.phone}`}><span>Позвонить</span> <span className="phone-num">{ad.phone}</span></a>
            </div>
        </div>
    );
}

function HomePage({ ads, filters, setFilters, tabTrigger }) {
    const [openedAd, setOpenedAd] = React.useState(null);

    React.useEffect(() => {
        setOpenedAd(null);
    }, [filters.gender, filters.age, filters.breastSize, filters.price1h, filters.price2h, filters.priceNight, tabTrigger]);

    // фильтрация: "цена от"
    const filteredAds = ads.filter(ad => {
        const genderMatch = filters.gender === 'all' || ad.gender === filters.gender;
        const ageMatch = !filters.age || ad.age >= Number(filters.age);
        const breastSizeMatch = !filters.breastSize || ad.breastSize >= Number(filters.breastSize);
        const price1hMatch = !filters.price1h || (ad.price1h && ad.price1h >= Number(filters.price1h));
        const price2hMatch = !filters.price2h || (ad.price2h && ad.price2h >= Number(filters.price2h));
        const priceNightMatch = !filters.priceNight || (ad.priceNight && ad.priceNight >= Number(filters.priceNight));
        return genderMatch && ageMatch && breastSizeMatch && price1hMatch && price2hMatch && priceNightMatch;
    });

    return (
        <div className="home-page-wrapper">
            <SidebarFilters filters={filters} setFilters={setFilters} />
            <div className="home-page">
                <h1>Объявления</h1>
                <div className="cards">
                    {filteredAds.length === 0 && <p>Объявлений не найдено.</p>}
                    {filteredAds.map((ad, index) => (
                        <div key={index} className="card" onClick={() => setOpenedAd(ad)} tabIndex={0}>
                            <img src={ad.photo} alt="User" className="profile-photo" />
                            <h2>{ad.name}, {ad.age}</h2>
                            <p><strong>Пол:</strong> {ad.gender}</p>
                            <p><strong>Размер груди:</strong> {ad.breastSize}</p>
                            <p><strong>Описание:</strong> {ad.description}</p>
                            <p className="price"><strong>1ч:</strong> {ad.price1h} ₽</p>
                            <p className="price"><strong>2ч:</strong> {ad.price2h} ₽</p>
                            <p className="price"><strong>Ночь:</strong> {ad.priceNight} ₽</p>
                        </div>
                    ))}
                </div>
                <AdModal ad={openedAd} onClose={() => setOpenedAd(null)} />
            </div>
        </div>
    );
}


function GenderNav({ filters, setFilters, onTab }) {
    // onTab - для триггера HomePage rerender
    return (
        <div className="gender-nav">
            <button
                className={filters.gender === 'all' ? 'active' : ''}
                onClick={() => { setFilters(f => ({ ...f, gender: 'all' })); onTab(); }}
                type="button"
            >
                Все
            </button>
            <button
                className={filters.gender === 'male' ? 'active' : ''}
                onClick={() => { setFilters(f => ({ ...f, gender: 'male' })); onTab(); }}
                type="button"
            >
                Мужчины
            </button>
            <button
                className={filters.gender === 'female' ? 'active' : ''}
                onClick={() => { setFilters(f => ({ ...f, gender: 'female' })); onTab(); }}
                type="button"
            >
                Женщины
            </button>
            <button
                className={filters.gender === 'trans' ? 'active' : ''}
                onClick={() => { setFilters(f => ({ ...f, gender: 'trans' })); onTab(); }}
                type="button"
            >
                Транс
            </button>
        </div>
    );
}

function App() {
    // Для HomePage rerender, чтобы фильтры сразу работали после добавления объявления или смены tab
    const [tabTrigger, setTabTrigger] = useState(0);

    // Инициализация данных из localStorage
    const [user, setUser] = useState(() => loadUser());
    const [ads, setAds] = useState(() => loadAds() || TEST_ADS);
    const [filters, setFilters] = useState({
        gender: 'all',
        age: '',
        breastSize: '',
        price1h: '',
        price2h: '',
        priceNight: ''
    });
    const [ageVerified, setAgeVerified] = useState(localStorage.getItem('ln_age_verified') === '1');

    // localStorage sync
    useEffect(() => { saveUser(user); }, [user]);
    useEffect(() => { saveAds(ads); }, [ads]);

    // Если обновили страницу — всё сохраняется!

    // Навигация для хука перехода на главную и сброса фильтров при регистрации/добавлении объявления


    // При регистрации
    const handleRegister = (userData) => {
        setUser({ ...userData, ad: null });
        setTimeout(() => { setTabTrigger(t => t + 1); }, 50);
    };

    // При добавлении объявления
    const handleAdSubmit = (adData) => {
        if (user) {
            const newAd = {
                ...user,
                ...adData,
                breastSize: Number(adData.breastSize),
                price1h: Number(adData.price1h),
                price2h: Number(adData.price2h),
                priceNight: Number(adData.priceNight),
                phone: user.phone
            };
            setAds(prev => [...prev, newAd]);
            setUser({ ...user, ad: {
                    ...adData,
                    breastSize: Number(adData.breastSize),
                    price1h: Number(adData.price1h),
                    price2h: Number(adData.price2h),
                    priceNight: Number(adData.priceNight)
                } });
            setTimeout(() => { setTabTrigger(t => t + 1); }, 50);
        }
    };

    // Функция для GenderNav, чтобы home/category сразу работало
    const triggerTab = () => setTabTrigger(t => t + 1);

    // AgeGate
    if (!ageVerified) {
        return <AgeGate onSuccess={() => setAgeVerified(true)} />;
    }

    return (
        <BrowserRouter>
            <div className="App">
                <header>
                    <nav>
                        <Link to="/"><span className="logo">LoveNight<span className="age18">18+</span></span></Link>
                        <GenderNav filters={filters} setFilters={setFilters} onTab={triggerTab} />
                        <div className="nav-buttons">
                            {!user && <Link to="/register"><button>Регистрация</button></Link>}
                            {user && <Link to="/profile"><button>Профиль</button></Link>}
                            {user && <Link to="/create-ad"><button>Добавить объявление</button></Link>}
                            <Link to="/"><button>Главная</button></Link>
                        </div>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={
                            <HomePage ads={ads} filters={filters} setFilters={setFilters} tabTrigger={tabTrigger} />
                        } />
                        <Route path="/register" element={<RegisterWindow onRegister={handleRegister} />} />
                        <Route path="/profile" element={<Profile user={user} />} />
                        <Route path="/create-ad" element={<CreateAd onAdSubmit={handleAdSubmit} user={user} />} />
                    </Routes>
                </main>
                <footer>
                    <span>© 2025 LoveNight 18+. Только для лиц старше 18 лет.</span>
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;