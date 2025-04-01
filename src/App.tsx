import React, {useState} from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AssetList from './components/AssetList/AssetList.tsx';
import AddAssetForm from './components/AddAssetForm/AddAssetForm.tsx';
import './App.scss';
import './assets/reset.scss';
import PriceChart from "./components/PriceChart/PriceChart.tsx";

const App: React.FC = () => {
    // Состояние для хранения введённого значения
    const [inputValue, setInputValue] = useState<string>('');
    // Состояние для хранения выбранной торговой пары
    const [assetName, setAssetName] = useState<string>('BTCUSDT');

    const handleApply = () => {
        if (inputValue.trim() !== '') {
            setAssetName(inputValue.toUpperCase()); // Преобразуем в верхний регистр
            setInputValue(''); // Очищаем поле ввода
        }
    };

    return (
        <Provider store={store}>
            <div className="app">
                <h1>Portfolio Overview</h1>

                {/* Поле ввода для торговой пары */}
                <div className="input-container">
                    <label htmlFor="asset-input" className="input-label">
                        Введите торговую пару:
                    </label>
                    <input
                        id="asset-input"
                        type="text"
                        className="input-field"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)} // Преобразуем в верхний регистр
                        placeholder="Например, BTCUSDT"
                    />
                    <button className="apply-button" onClick={handleApply} tabIndex={0}>
                        Применить
                    </button>
                </div>
                <PriceChart asset={assetName}/>

                <AddAssetForm />
                <AssetList />
            </div>
        </Provider>
    );
};

export default App;