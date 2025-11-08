import React, { useState, useEffect } from 'react';
import './header.css';
import ThemeSwitch from '../../components/switch/themeSwitch';
import Loading from '../../components/Loading/Loading';
import '../../components/Loading/Loading.css';
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
        if (lower.includes('sun') || lower.includes('clear')) return <Sun />;
        if (lower.includes('cloud')) return <Cloud />;
        if (lower.includes('rain') || lower.includes('drizzle'))
            return <CloudRain />;
        if (lower.includes('storm') || lower.includes('thunder'))
            return <CloudLightning />;
        if (lower.includes('snow')) return <Snowflake />;
        if (
            lower.includes('fog') ||
            lower.includes('mist') ||
            lower.includes('haze')
        )
            return <CloudFog />;
        return <Cloud />; // default fallback
    };

    return (
        <header className="header-main">
            <div className="header-inner">
                <div className="header-items">
                    <Calendar />
                    <div>
                        <p>{currentDate.day}</p>
                        <p>{currentDate.date}</p>
                    </div>
                </div>

                <div className="header-items">
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
                                <p>
                                    {weather.temp}, {weather.condition}
                                </p>
                                <p>{weather.location}</p>
                            </>
                        ) : (
                            <p
                                style={{
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

            <div>Tathya</div>

            <div
                className="header-inner"
                style={{ flexGrow: 0.2 }}>
                <div className="header-items">
                    <Mail />
                    <p>SUBSCRIBE</p>
                </div>
                <div>
                    <ThemeSwitch />
                </div>
            </div>
        </header>
    );
};

export default Header;
