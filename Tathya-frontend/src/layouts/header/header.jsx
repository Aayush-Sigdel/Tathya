import React, { useState, useEffect } from 'react';
import styles from './header.module.css';
import ThemeSwitch from '../../components/switch/themeSwitch';
import Loading from '../../components/Loading/Loading';
import '../../components/Loading/Loading.css';
import LogoSvg from '../../assets/Logo-main.svg';

import {
    Calendar,
    Cloud,
    CloudRain,
    Sun,
    Snowflake,
    CloudLightning,
    CloudFog,
    Mail,
} from 'lucide-react';

const Header = () => {
    const [currentDate, setCurrentDate] = useState({ day: '', date: '' });
    const [weather, setWeather] = useState({
        temp: '',
        condition: '',
        location: '',
    });
    const [hasLocation, setHasLocation] = useState(true);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);

    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            const day = now.toLocaleDateString('en-US', { weekday: 'long' });
            const date = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
            setCurrentDate({ day, date });
        };

        updateDate();
        const interval = setInterval(updateDate, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const cached = localStorage.getItem('userLocation');
        if (cached) {
            const { latitude, longitude, name } = JSON.parse(cached);
            fetchWeather({ coords: { latitude, longitude } }, name);
        } else {
            setHasLocation(false);
        }
    }, []);

    const fetchWeather = async (position, customName = null) => {
        setIsLoadingWeather(true);
        try {
            const { latitude, longitude } = position.coords;
            const url = `https://wttr.in/${latitude},${longitude}?format=j1`;
            const response = await fetch(url);
            const data = await response.json();

            const current = data.current_condition[0];
            const locationName =
                customName ||
                data.nearest_area?.[0]?.areaName?.[0]?.value ||
                'Your Location';

            localStorage.setItem(
                'userLocation',
                JSON.stringify({ latitude, longitude, name: locationName })
            );

            setWeather({
                temp: `${current.temp_C}°C`,
                condition: current.weatherDesc[0].value,
                location: locationName,
            });
            setHasLocation(true);
        } catch (error) {
            console.error('Weather fetch error:', error);
            setWeather({
                temp: '22°C',
                condition: 'Clear Sky',
                location: 'Your Location',
            });
        } finally {
            setIsLoadingWeather(false);
        }
    };

    const handleSetLocation = async () => {
        try {
            const permission = await navigator.permissions.query({
                name: 'geolocation',
            });

            if (
                permission.state === 'granted' ||
                permission.state === 'prompt'
            ) {
                navigator.geolocation.getCurrentPosition(fetchWeather, () => {
                    setHasLocation(false);
                    setIsLoadingWeather(false);
                });
            } else {
                alert(
                    'Location permission denied. Please enable it in settings.'
                );
            }
        } catch (error) {
            console.error('Location request error:', error);
            setHasLocation(false);
            setIsLoadingWeather(false);
        }
    };

    const getWeatherIcon = (condition) => {
        const lower = condition.toLowerCase();
        if (lower.includes('sun') || lower.includes('clear'))
            return <Sun width={18} />;
        if (lower.includes('cloud')) return <Cloud width={18} />;
        if (lower.includes('rain') || lower.includes('drizzle'))
            return <CloudRain width={18} />;
        if (lower.includes('storm') || lower.includes('thunder'))
            return <CloudLightning width={18} />;
        if (lower.includes('snow')) return <Snowflake width={18} />;
        if (
            lower.includes('fog') ||
            lower.includes('mist') ||
            lower.includes('haze')
        )
            return <CloudFog width={18} />;
        return <Cloud width={18} />; // default fallback
    };

    return (
        <header className={styles['header-main']}>
            <div>
                <img
                    src={LogoSvg}
                    alt="Tathya logo"
                    style={{ height: '75px', marginRight: '8px' }}
                />
            </div>
            <div>
                <div className={styles['header-inner']}>
                    <div className={styles['header-items']}>
                        {getWeatherIcon(weather.condition)}
                        <div>
                            {isLoadingWeather ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                    <Loading size="small" />
                                    <p>Loading weather...</p>
                                </div>
                            ) : hasLocation ? (
                                <>
                                    <p style={{ fontSize: 12 }}>
                                        {weather.temp} {weather.condition},{' '}
                                        {weather.location}
                                    </p>
                                </>
                            ) : (
                                <p
                                    style={{
                                        fontSize: 12,
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        color: 'var(--accent-color, #007bff)',
                                    }}
                                    onClick={handleSetLocation}>
                                    Set Location
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles['header-items']}>
                    <Calendar width={18} />
                    <div>
                        <p style={{ fontSize: 12 }}>
                            {currentDate.day} {currentDate.date}
                        </p>
                    </div>
                </div>
                {/* <div
                className={styles['header-inner']}
                style={{ flexGrow: 0.2 }}>
                <div>
                    <ThemeSwitch />
                </div>
            </div> */}
            </div>
        </header>
    );
};

export default Header;
